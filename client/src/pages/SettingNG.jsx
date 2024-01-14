import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from '@ant-design/icons';
import { getAllNgDatas, addNg, setstateNg, deleteNgData } from "../redux/reducers/ngSlice";
import { Popover, Button, Input, Space, Switch, Badge, Card } from "antd";
const SettingNG = () => {
  const dispatch = useDispatch();
  const [ngData, setNgData] = useState({});
  const [wordOption, setWordOption] = useState({});
  const [orwordOption, setOrwordOption] = useState({});
  let {  check, ngdatas } = useSelector((state) => state.ng);
  let {  userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllNgDatas(userInfo._id));
  }, [dispatch, check]);


  const content = (
    <div>
      <Space.Compact style={{ width: '100%' }}>
        <Input onChange={(e) => { setWordOption((preState) => { return ({ ...preState, value: e.target.value }) }) }} value={wordOption.value} />
        <Button onClick={(e) => {
          use_Ng({
            kind: wordOption.kind, value: orwordOption.value, editedValue: wordOption.value, flag: wordOption.flag, userId:userInfo._id
          })
        }} type="default">変更</Button>
      </Space.Compact>
      <div className=" items-center flex justify-between mx-5 pt-5">

        <Switch onClick={(e) => {
          use_Ng({
            kind: wordOption.kind, value: wordOption.value, flag: e, editedValue: wordOption.value, userId:userInfo._id
          })
          setWordOption((preState) => { return ({ ...preState, flag: e }) })
        }
        } checkedChildren="活性化" unCheckedChildren="無効" value={wordOption.flag} />
        <Button size="small" type="primary" danger shape="round" onClick={() => {
          dispatch(deleteNgData({
            kind: wordOption.kind, value: wordOption.value, userId:userInfo._id
          }));

        }}>
          <DeleteOutlined />削除
        </Button>
      </div>
    </div>
  )
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNgData((prevState) => ({
      ...prevState,
      [name]: { value: value, flag: false },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(addNg(ngData));
    setNgData({
      ngword: undefined,
      excludeword: undefined,
      ngcategory: undefined,
      ngasin: undefined,
      ngbrand: undefined,
      userId:userInfo._id
    });
  };
  const use_Ng = (data) => {
    dispatch(setstateNg(data));
  }

  window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  return (
    <section className="absolute h-[92vh] w-full py-3 ">
      <div className="flex gap-3 justify-between h-full px-3">
        <div className="card ng-main-content w-full h-full">
          <div className="flex w-full gap-3 mb-2">
            <div className=" w-[50%]">
              <Badge.Ribbon text="NGワード" color="lightsalmon">
                <Card size="small ng-card">
                  <div className="exhi_words">
                    {
                      ngdatas.length ? ngdatas[0].ngword.map((word, index) => {
                        return (
                          <Popover content={content} onClick={() => {
                            setOrwordOption({ ...word, kind: 'ngword' })
                            setWordOption({ ...word, kind: 'ngword' })
                          }
                          } title="設定" trigger='click'>
                            <div key={index} className="exhi_word">
                              <div className="exhi_word_item">
                                <label>{word.value}</label>
                              </div>
                              <svg className={word.flag ? 'activate_ng' : 'disabled_ng'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </div>
                          </Popover>
                        )
                      }) : '内容なし'
                    }
                  </div>
                </Card>
              </Badge.Ribbon>
            </div>
            <div className=" w-[50%]">
              <Badge.Ribbon text="除外ワード" color="lightsalmon">
                <Card size="small ng-card">
                  <div className="exhi_words">
                    {
                      ngdatas.length ? ngdatas[0].excludeword.map((word, index) => {
                        return (
                          <Popover content={content} onClick={() => {
                            setOrwordOption({ ...word, kind: 'excludeword' })
                            setWordOption({ ...word, kind: 'excludeword' })
                          }} title="設定" trigger='click'>
                            <div key={index} className="exhi_word">
                              <div className="exhi_word_item">
                                <label>{word.value}</label>
                              </div>
                              <svg className={word.flag ? 'activate_ng' : 'disabled_ng'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </div>
                          </Popover>
                        )
                      }) : '内容なし'
                    }
                  </div>
                </Card>
              </Badge.Ribbon>
            </div>
          </div>
          <div className="flex w-full gap-3 mb-2">
            <div className=" w-[50%]">
              <Badge.Ribbon text="NGカテゴリ" color="lightsalmon">
                <Card size="small ng-card">
                  <div className="exhi_words">
                    {
                      ngdatas.length ? ngdatas[0].ngcategory.map((word, index) => {
                        return (
                          <Popover content={content} onClick={() => {
                            setOrwordOption({ ...word, kind: 'ngcategory' })
                            setWordOption({ ...word, kind: 'ngcategory' })
                          }} title="設定" trigger='click'>
                            <div key={index} className="exhi_word">
                              <div className="exhi_word_item">
                                <label>{word.value}</label>
                              </div>
                              <svg className={word.flag ? 'activate_ng' : 'disabled_ng'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </div>
                          </Popover>
                        )
                      }) : '内容なし'
                    }
                  </div>
                </Card>
              </Badge.Ribbon>
            </div>
            <div className=" w-[50%]">
              <Badge.Ribbon text="NGASIN" color="lightsalmon">
                <Card size="small ng-card">
                  <div className="exhi_words">
                    {
                      ngdatas.length ? ngdatas[0].ngasin.map((word, index) => {
                        return (
                          <Popover content={content} onClick={() => {
                            setOrwordOption({ ...word, kind: 'ngasin' })
                            setWordOption({ ...word, kind: 'ngasin' })
                          }} title="設定" trigger='click'>
                            <div key={index} className="exhi_word">
                              <div className="exhi_word_item">
                                <label>{word.value}</label>
                              </div>
                              <svg className={word.flag ? 'activate_ng' : 'disabled_ng'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </div>
                          </Popover>
                        )
                      }) : '内容なし'
                    }
                  </div>
                </Card>
              </Badge.Ribbon>
            </div>
          </div>
          <div className="flex w-full">
            <div className=" w-[50%]">
              <Badge.Ribbon text="NGブランド" color="lightsalmon">
                <Card size="small ng-card">
                  <div className="exhi_words">
                    {
                      ngdatas.length ? ngdatas[0].ngbrand.map((word, index) => {
                        return (
                          <Popover content={content} onClick={() => {
                            setOrwordOption({ ...word, kind: 'ngbrand' })
                            setWordOption({ ...word, kind: 'ngbrand' })
                          }} title="設定" trigger='click'>
                            <div key={index} className="exhi_word">
                              <div className="exhi_word_item">
                                <label>{word.value}</label>
                              </div>
                              <svg className={word.flag ? 'activate_ng' : 'disabled_ng'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </div>
                          </Popover>
                        )
                      }) : '内容なし'
                    }
                  </div>
                </Card>
              </Badge.Ribbon>
            </div>

          </div>

        </div>
        <div className="card py-10">
          <form className=" min-w-[300px]  h-full flex flex-col justify-between" onSubmit={handleSubmit}>
            <div className="">
              <div className="pb-[20px]">
                <label
                  htmlFor="ngword"
                  className="block text-sm font-medium text-gray-700"
                >
                  NGワード
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="ngword"
                    name="ngword"
                    onChange={handleInputChange}
                    value={ngData.ngword?.value || ''}
                    className=""
                  />
                </div>
              </div>
              <div className="pb-[20px]">
                <label
                  htmlFor="excludeword"
                  className="block text-sm font-medium text-gray-700"
                >
                  除外ワード
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="excludeword"
                    name="excludeword"
                    onChange={handleInputChange}
                    value={ngData.excludeword?.value || ''}
                    className=""
                  />
                </div>
              </div>
              <div className="pb-[20px]">
                <label
                  htmlFor="ngcategory"
                  className="block text-sm font-medium text-gray-700"
                >
                  NGカテゴリ
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="ngcategory"
                    name="ngcategory"
                    onChange={handleInputChange}
                    value={ngData.ngcategory?.value || ''}
                    className=""
                  />
                </div>
              </div>
              <div className="pb-[20px]">
                <label
                  htmlFor="ngasin"
                  className="block text-sm font-medium text-gray-700"
                >
                  NGASIN
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="ngasin"
                    name="ngasin"
                    onChange={handleInputChange}
                    value={ngData.ngasin?.value || ''}
                    className=""
                  />
                </div>
              </div>
              <div className="pb-[20px]">
                <label
                  htmlFor="ngbrand"
                  className="block text-sm font-medium text-gray-700"
                >
                  NGブランド
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="ngbrand"
                    name="ngbrand"
                    onChange={handleInputChange}
                    value={ngData.ngbrand?.value || ''}
                    className=""
                  />
                </div>
              </div>
            </div>
            <div>
              <button
                className="h-[40px] w-full mt-8 rounded-md mb-2 text-white flex items-center justify-center border border-blue shadow-[inset_0_0_0_0_#ffede1] hover:shadow-[inset_0_-4rem_0_0_#909de9] hover:text-blue transition-all duration-300"
                type="submit"
              >
                追 加
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SettingNG;