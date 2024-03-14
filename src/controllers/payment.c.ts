import { Request, Response } from 'express';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';

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
    }
};

export default apidocController;
