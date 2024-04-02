import axios from "axios";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { APP_SECRET } = require("../config");


module.exports.FormateData = (data: any) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.PublishSalonEvent = async (payload: any) => {
    axios.post('http://localhost:5003/app-events/', {
        payload
    })
}