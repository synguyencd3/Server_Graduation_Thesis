import { Request, Response } from 'express';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import querystring from 'qs';
import * as crypto from 'crypto';

const config = {
    appid: 2554,
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
}

const headers = {
    'Content-Type': 'application/json',
};


// Hàm để lấy ngày hiện tại theo múi giờ Việt Nam (GMT+7)
function getCurrentDateInVNTimeZone() {
    const now = new Date();
    const utcOffset = 7; // Múi giờ Việt Nam (GMT+7)
    const vnTime = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);
    return vnTime;
}

// function generateRandomNumber(min: number, max: number): number {
//     const range = max - min + 1;
//     const bytesNeeded = Math.ceil(Math.log2(range) / 8);
//     const randomBytesBuffer = crypto.randomBytes(bytesNeeded);

//     let randomNumber = 0;
//     for (let i = 0; i < bytesNeeded; i++) {
//         randomNumber = (randomNumber << 8) + randomBytesBuffer[i];
//     }

//     return min + randomNumber % range;
// }

// Hàm để format ngày thành dạng yymmdd
function formatDateToYYMMDD(date: Date) {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
}

// Tạo mã giao dịch
function generateAppTransId(orderId: string | number) {
    const currentDate = getCurrentDateInVNTimeZone();
    const datePart = formatDateToYYMMDD(currentDate);
    return datePart + "_" + orderId;
}

function sortObject(obj: any) {
    var sorted: any = {};
    var str = [];
    var key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const apidocController = {
    createOrder: (req: Request, res: Response) => {
        let appTransId = generateAppTransId(Math.floor(Math.random() * 1000000));
        let order = {
            "app_id": config.appid,
            "app_trans_id": appTransId,
            "app_user": "ZaloPayDemo",
            "app_time": Date.now(),
            "item": req.body.item || "[]",
            "embed_data": "{}",
            "amount": req.body.amount || 1,
            "description": req.body.description || "Demo thanh toan don hang #" + appTransId,
            "bank_code": req.body.bank_code || "zalopayapp",
            // "bank_code": "CC",
            "mac": "",
        }

        const data = order.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;

        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        axios.post('https://sb-openapi.zalopay.vn/v2/create', order, { headers })
            .then((response: { data: any; }) => {
                return res.json({data: response.data, appTransId});
            })
            .catch((error: any) => {
                return res.json(error);
            });
    },

    queryOrder: (req: Request, res: Response) => {
        const order = {
            "app_id": config.appid,
            "app_trans_id": req.body.app_trans_id || '',
            "mac": "",
        }
        
        const data = order.app_id  + "|" + order.app_trans_id + "|" + config.key1;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        axios.post('https://sb-openapi.zalopay.vn/v2/query', order, {headers})
        .then((response: { data: any; }) => {
            return res.json({data: response.data});
        })
        .catch((error: any) => {
            return res.json(error);
        });
    },

    vnpay: (req: Request, res: Response) => {
        const date = new Date();

        date.setHours(date.getHours() + 7); // GMT+7

        // Lấy các thành phần của ngày giờ (năm, tháng, ngày, giờ, phút, giây)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm số 0 đằng trước nếu cần
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');


        const config_vn = {
            vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            vnp_HashSecret: "BFMLNCHNKMQDFZVJAKCUJULATTDTAMKQ"
        };

        var vnp_Params: any = {};

        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = "DRQT53YH";
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = "vn";
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = Math.floor(Math.random() * 100) + 1;        ;
        vnp_Params['vnp_OrderInfo'] = req.body.description || "Demo thanh toan VN Pay";
        vnp_Params['vnp_OrderType'] = "other";
        vnp_Params['vnp_Amount'] = req.body.amount* 100 || 1806000 * 100;
        vnp_Params['vnp_ReturnUrl'] = "https://www.youtube.com/watch?v=mzqvF_rIOx8";
        vnp_Params['vnp_IpAddr'] = "127.0.0.1";
        vnp_Params['vnp_CreateDate'] = `${year}${month}${day}${hours}${minutes}${seconds}`;



        let vnpUrl = config_vn.vnp_Url ;
        let secretKey = config_vn.vnp_HashSecret;

        vnp_Params = sortObject(vnp_Params);

        var signData = querystring.stringify(vnp_Params, { encode: false });
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        return res.json({ vnpUrl});
    }
};

export default apidocController;
