import fs from "fs";

export const newLogs = async (id: string, data = "") => {
    let content = !data ? `----------------THE SALON WITH ID IS ${id}----------------\n` : data;
    const filePath = `src/logs/${id}.txt`;

    // write data continue.
    fs.appendFile(filePath, content, (err) => {
        if (err) {
            console.error('Đã xảy ra lỗi khi viết tiếp nội dung vào file:', err);
            return;
        }
        console.log('Nội dung đã được viết tiếp vào file!');
    });



}


