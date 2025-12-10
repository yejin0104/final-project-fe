import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import "./KakaoPay.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function KakaoPay() {

    const [giftcardList, setGiftcardList] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const changeCheckAll = useCallback(e => {
        setCheckAll(e.target.checked);
        setGiftcardList(prev =>
            prev.map(
                giftcard => ({
                    ...giftcard,
                    check: e.target.checked,
                })
            )
        );
    }, []);

    const checkedGiftcardList = useMemo(() => {
        return giftcardList.filter(giftcard => giftcard.check === true);
    }, [giftcardList]);

    const checkedTotal = useMemo(() => {
        return checkedGiftcardList.reduce(
            (total, giftcard) => total + (giftcard.giftcardPrice * giftcard.qty),
            0
        );
    }, [checkedGiftcardList]);

    const loadData = useCallback(async () => {
        const { data } = await axios.get("/giftcard/");

        const convert = data.map(g => ({
            ...g,
            check: false,
            qty: 1
        }));
        setGiftcardList(convert);
    }, []);

    const changeGiftcardCheck = useCallback(e => {
        const { value, checked } = e.target;

        const convert = giftcardList.map(giftcard => {
            if (giftcard.giftcardNo === parseInt(value)) {
                return { ...giftcard, check: checked };
            }
            return giftcard;
        });

        const count = convert.filter(giftcard => giftcard.check === true).length;

        setGiftcardList(convert);
        setCheckAll(convert.length === count);
    }, [giftcardList]);

    const changeGiftcardQty = useCallback(e => {
        const giftcardNo = e.target.dataset.pk;
        const value = e.target.value;

        const convert = giftcardList.map(giftcard => {
            if (giftcard.giftcardNo === parseInt(giftcardNo)) {
                return { ...giftcard, qty: parseInt(value) };
            }
            return giftcard;
        });

        setGiftcardList(convert);
    }, [giftcardList]);

    const changeGiftcardQty2 = useCallback((e, obj) => {
        const convert = giftcardList.map(giftcard => {
            if (giftcard.giftcardNo === obj.giftcardNo) {
                const number = parseInt(e.target.value);
                return { ...giftcard, qty: Number.isNaN(number) ? 0 : number };
            }
            return giftcard;
        });
        setGiftcardList(convert);
    }, [giftcardList]);

    const navigate = useNavigate();
    const purchase = useCallback(async () => {

        const convertList = checkedGiftcardList.map(giftcard => ({
            no: giftcard.giftcardNo,
            qty: giftcard.qty
        }));

        const { data } = await axios.post("/kakaopay/buy", convertList);

        navigate(data.next_redirect_pc_url);

    }, [checkedGiftcardList]);

    const numberWithComma = useCallback((x) => {
        if (x === null || x === undefined || x === '') {
            return '';
        }

        const numString = String(x);

        const parts = numString.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return formattedInteger + decimalPart;
    }, []);

    return (<>

        <Jumbotron subject="카카오페이 결제" detail="무엇을 살지 정해야 함" />

        <div className="row mt-4">
            <div className="col-6">
                <Link to="/kakaopay/pay/info" className="none-decortion">결제 내역 보기</Link>
            </div>
            <div className="col-6">
                <Link to="/" className="none-decortion">홈</Link>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <div className="text-nowrap table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox"
                                        checked={checkAll}
                                        onChange={changeCheckAll} />
                                </th>
                                <th>이름</th>
                                <th>금액</th>
                                <th>포인트</th>
                                <th width="100">수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {giftcardList.map(giftcard => (
                                <tr key={giftcard.giftcardNo}>
                                    <td className="checkbox-cell">
                                        <input type="checkbox" value={giftcard.giftcardNo}
                                            checked={giftcard.check} onChange={changeGiftcardCheck} />
                                    </td>
                                    <td className="checkbox-cell">
                                        {giftcard.giftcardName}
                                    </td>
                                    <td className="checkbox-cell">
                                        {numberWithComma(giftcard.giftcardPrice)}원
                                    </td>
                                    <td className="checkbox-cell">
                                        {numberWithComma(giftcard.giftcardPoint)}포인트
                                    </td>
                                    <td className="checkbox-cell">
                                        <input type="number" inputMode="numeric"
                                            className="form-control" min={1}
                                            value={numberWithComma(giftcard.qty)}
                                            disabled={giftcard.check === false}
                                            onChange={e => changeGiftcardQty2(e, giftcard)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col fs-2">
                {numberWithComma(checkedGiftcardList.length)}개의 상품권
            </div>
            <div className="col text-end fs-2">
                금액:{numberWithComma(checkedTotal)}원
            </div>
        </div>

        <div className="row mt-4">
            <div className="col text-end">
                <button className="btn btn-lg btn-success" onClick={purchase}
                    disabled={checkedGiftcardList.length === 0}>구매</button>
            </div>
        </div>

    </>)
}