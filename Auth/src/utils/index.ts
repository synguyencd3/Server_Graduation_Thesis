import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

module.exports.FormateData = (data: any) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

const config = {
  headers: {
    'Content-Type': 'application/json',
    'secret': process.env.SESSION_SECRET_KEY
  }
}

export const PublishUserEvent = async (payload: any) => {

  try {
    const rs = await axios.post('http://localhost:5003/app-events', {
      payload
  }, config)
  console.log("Connect from auth to user successfully!", rs.data);
  } catch (error) {
    console.log(error)
  }

}