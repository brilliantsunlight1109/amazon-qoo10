const axios = require("axios");
const XLSX = require("xlsx");
const Category = require("../models/category");
const Product = require("../models/Product");
const NgData = require("../models/NgData");
const AmazonCategory = require("../models/amazonCategory");
const TransFee = require("../models/TransFee");
const AddPrice = require("../models/AddPrice");
const SubQuantity = require("../models/SubQuantity");
const amazonCategory = require("../models/amazonCategory");
const workbook = XLSX.readFile("./qoo10category.xlsx");
const amazonbook = XLSX.readFile("./CategoryMatch.xlsx");
const worksheet = workbook.Sheets["Qoo10_CategoryInfo"];
const amazonsheet = amazonbook.Sheets["CategoryMatch"];

const createCategory = async () => {
  const category = await Category.find();
  if (category.length === 0) {
    const good = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const documents = good.map((row, index) => {
      return {
        subCategory: row[4],
        subCategoryName: row[1] + row[3] + row[5],
      };
    });
    Category.insertMany(documents)
      .then((result) => {})
      .catch((err) => {
        console.error("ドキュメントの挿入エラー:", err);
      })
      .finally(() => {});
  }
};
createCategory();
const createAmazonCategory = async () => {
  const amazoncategory = await AmazonCategory.find();
  if (amazoncategory.length === 0) {
    const amazonCategory = XLSX.utils.sheet_to_json(amazonsheet, { header: 1 });
    const qoo10categories = await createCategory();

    const documents = amazonCategory.map((row, index) => {
      const data = row[0];
      let category = "";
      for (i = 0; i < qoo10categories.length; i++) {
        if (
          data.includes(qoo10categories[i].bigCategory.slice(0, 2)) &&
          data.includes(
            qoo10categories[i].subCategoryName ||
              (data.includes(qoo10categories[i].bigCategory.slice(0, 3)) &&
                data.includes(qoo10categories[i].subCategoryName))
          )
        ) {
          category = qoo10categories[i].subCategory;
          break;
        }
      }
      return {
        categoryContent: row[0],
        qoo10category: category || "300000207",
      };
    });
    console.log("document", documents);
    AmazonCategory.insertMany(documents)
      .then((result) => {})
      .catch((err) => {
        console.error("ドキュメントの挿入エラー:", err);
      })
      .finally(() => {});
  }
};
// createAmazonCategory();
const CreateCertificationKey = async () => {
  const url =
    "https://api.qoo10.jp/GMKT.INC.Front.QAPIService/CertificationAPI.qapi/CreateCertificationKey";
  const requestConfig = {
    headers: {
      Giosiscertificationkey: process.env.API_KEY,
    },
    params: {
      user_id: process.env.USER_ID,
      pwd: process.env.USER_PASSWORD,
    },
  };
  const result = await axios.get(url, requestConfig);
  return result.data.ResultObject;
};

const getQoo10Category = async (req, res) => {
  Category.find()
    .then((categories) => res.json({ categories }))
    .catch((err) =>
      res.status(404).json({ nopostfound: "No categories found" })
    );
};
const setNewGoods = async (req, res) => {
  try {
    const { checkedKeys, userId, exceptedKeys } = req.body;
    const transfee = await TransFee.find({ _id: userId });
    const addprice = await AddPrice.find({ user_id: userId });
    const subquantity = await SubQuantity.find({ _id: userId });
    const categories = await Category.find();
    const certificationKey = await CreateCertificationKey();
    const url =
      "https://api.qoo10.jp/GMKT.INC.Front.QAPIService/ItemsBasic.qapi/SetNewGoods";
    const dbProducts = await Product.find();
    const products = checkedKeys.map((key) => {
      return dbProducts[key];
    });
    let sentProducts = [];
    let deletedProducts = [];
    // console.log(addprice, transfee, subquantity);
    for (i = 0; i < products.length; i++) {
      const good = products[i];
      let qoo10category = "";
      const subcategories = categories.filter((cat) => {
        return cat.subCategoryName.includes(good.amaparentCat);
      });
      qoo10category = subcategories[0].subCategory;
      subcategories.forEach((cat) => {
        if (cat.subCategoryName.includes(good.amaCat))
          qoo10category = cat.subCategory;
        return;
      });
      console.log(qoo10category);
      let shippingNo = transfee[0].transfee_4;
      if (good.package) {
        const size = good.package;
        const sum = size.height.value + size.width.value + size.length.value;
        switch (sum) {
          case sum < 1:
            shippingNo = transfee[0].transfee_1;
            break;
          case sum < 30:
            shippingNo = transfee[0].transfee_2;
            break;
          case sum < 40:
            shippingNo = transfee[0].transfee_3;
            break;
          case sum < 50:
            shippingNo = transfee[0].transfee_4;
            break;
          case sum < 60:
            shippingNo = transfee[0].transfee_5;
            break;
          case sum > 60:
            shippingNo = transfee[0].transfee_6;
            break;
        }
      }
      const prices = addprice.filter((price) => {
        return price.price_scale > good.price;
      });
      let qoo10_price = good.price;
      if (prices.length) {
        qoo10_price = prices[0].odds_amount + prices[0].bene_rate * good.price;
      }
      // console.log(shippingNo, qoo10_price, subquantity[0].subquantity, prices);
      console.log(qoo10category, qoo10_price);
      const requestConfig = {
        headers: {
          Giosiscertificationkey: certificationKey,
        },
        params: {
          SecondSubCat: qoo10category,
          OuterSecondSubCat: good.asin || "",
          Drugtype: "1C" || "",
          BrandNo: "",
          ItemTitle: good.title.slice(0, 40) || "",
          PromotionName: "",
          SellerCode: "",
          IndustrialCodeType: "",
          IndustrialCode: "",
          ModelNM: "",
          ManufactureDate: "",
          AdditionalOption: good.asin,
          ProductionPlaceType: "1" || "",
          ProductionPlace: good.manufacturer || "",
          Weight: good.package.weight?.value ? good.package.weight?.value : "",
          Material: "",
          AdultYN: good.AdultYN ? "Y" : "N",
          ContactInfo: "",
          StandardImage: good.img[0].link || "",
          VideoURL: null || "",
          ItemDescription: good.description || "",
          ItemType: "",
          RetailPrice: "11" || "",
          ItemPrice: qoo10_price,
          ItemQty: subquantity[0].subquantity || 20,
          ExpireDate: "",
          ShippingNo: "",
          AvailableDateType: "0",
          AvailableDateValue: "1",
          Keyword: "",
        },
      };
      const qooResult = await axios.get(url, requestConfig);
      console.log(qooResult.data);
      if (!qooResult.data.ResultCode) {
        console.log("yas");
        await Product.findOneAndUpdate(
          { _id: good._id },
          {
            status: "出品済み",
            qoo10_price: qoo10_price,
            odds_amount: prices[0].odds_amount,
            bene_rate: prices[0].bene_rate,
            SecondSubCat: qoo10category,
            qoo10_quantity: subquantity[0].subquantity,
            ItemCode: qooResult.data.ResultObject.GdNo,
          }
        ).then(async () => {
          sentdata = await Product.find({ _id: good._id });
          sentProducts.push({ ...sentdata, status: "added" });
        });
      } else {
        sentdata = await Product.find({ _id: good._id });
        sentProducts.push({ ...sentdata, status: "failed" });
        deleteProductAndAddAsin(good);
      }
      console.log("yaa1");
    }
    console.log("yaa2");
    exceptedKeys.map((key) => {
      deleteProductAndAddAsin(dbProducts[key]);
    });
    res.status(200).json({
      message: "qoo10に正確に出品されました。",
      products: sentProducts,
    });
  } catch (err) {
    res.status(500).json({ err: err });
  }
};
const deleteProductAndAddAsin = async (good) => {
  await Product.deleteOne({ _id: good._id });
  let ngData = await NgData.find();
  if (ngData.length) {
    await NgData.updateOne(
      { _id: ngData[0]._id },
      {
        ngasin: [...ngData[0].ngasin, { flag: true, value: good.asin }],
      }
    )
      .then((products) => {
        console.log("ngsuccess");
      })
      .catch((err) => {
        console.log("ngerror");
      });
  } else {
    ngData = new NgData({
      ngword: undefined,
      excludeword: undefined,
      ngcategory: undefined,
      ngasin: [{ flag: true, value: good.asin }],
      ngbrand: undefined,
    });
    await ngData.save();
  }
};
const updatePrice = async (ItemCode, qoo10_price) => {
  const certificationKey = await CreateCertificationKey();
  const url =
    "https://api.qoo10.jp/GMKT.INC.Front.QAPIService/ItemsOrder.qapi/SetGoodsPriceQty";
  const requestConfig = {
    headers: {
      Giosiscertificationkey: certificationKey,
    },
    params: {
      ItemCode: ItemCode,
      SellerCode: "",
      Price: qoo10_price,
      Qty: "",
      ExpireDate: "",
    },
  };
  axios
    .get(url, requestConfig)
    .then(async (response) => {
      if (response) {
      }
    })
    .catch((error) => {
      // Handle the error
    });
};
const UpdateMydbOfQoo10 = async (ItemCode, last_quantity) => {
  const certificationKey = await CreateCertificationKey();
  const url = "https://api.qoo10.jp/GMKT.INC.Front.QAPIService/ebayjapan.qapi";
  const requestConfig = {
    params: {
      key: certificationKey,
      ItemCode: ItemCode,
      SellerCode: "",
      v: 1.2,
      returnType: "json",
      method: "ItemsLookup.GetItemDetailInfo",
      Qty: "",
      ExpireDate: "",
    },
  };
  axios
    .get(url, requestConfig)
    .then(async (response) => {
      if (response) {
        await Product.findOneAndUpdate(
          { ItemCode: ItemCode },
          {
            selledQuantity:
              last_quantity - response.data.ResultObject[0]?.ItemQty,
            ItemStatus: response.data.ResultObject[0]?.ItemStatus,
          }
        )
          .then(async (response1) => {
            if (response1) {
            }
          })
          .catch((error) => {
            // Handle the error
          });
      }
    })
    .catch((error) => {
      // Handle the error
    });
};
const deleteProductOfQoo10Mydb = async (req, res) => {
  // if (req.body.status == "出品済み") {
  //   const certificationKey = await CreateCertificationKey();
  //   console.log(certificationKey);
  //   const url =
  //     "https://api.qoo10.jp/GMKT.INC.Front.QAPIService/ebayjapan.qapi";
  //   const requestConfig = {
  //     params: {
  //       key: certificationKey,
  //       v: "1.0",
  //       returnType: "json",
  //       method: "ItemsOptions.DeleteInventoryDataUnit",
  //       ItemCode: req.body.ItemCode,
  //       SellerCode: "",
  //       OptionName: req.body.asin,
  //       OptionValue: "",
  //       OptionCode: "",
  //     },
  //   };
  //   axios
  //     .get(url, requestConfig)
  //     .then(async (response) => {
  //       if (response) {
  //         if (!response.data.ResultCode) {
  //           await Product.findOneAndDelete({ _id: req.body.id })
  //             .then((product) => {
  //               res.status(200).json(product);
  //             })
  //             .catch((error) => {
  //               res.status(404).json();
  //             });
  //         } else {
  //           res.status(404).json();
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       // Handle the error
  //       res.status(404).json();
  //     });
  // } else {
  await Product.findOneAndDelete({ _id: req.body._id })
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((error) => {
      res.status(404).json();
    });
  // }
};
module.exports = {
  setNewGoods,
  updatePrice,
  getQoo10Category,
  UpdateMydbOfQoo10,
  deleteProductOfQoo10Mydb,
};
