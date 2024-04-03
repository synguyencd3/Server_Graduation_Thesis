import axios from "axios";

module.exports.FormateData = (data: any) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

export const PublishAuthEvent = async (payload: any) => {
    axios.post('http://localhost:5002/app-events/', {
        payload
    })
}