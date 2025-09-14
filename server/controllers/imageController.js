import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import userModel from '../models/userModel.js';


const removeBackground = async (req, res) => {
    try {
        const clerkId = req.user.clerkId;
        const user = await userModel.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.creditBalance === 0) {
            return res.status(400).json({ success: false, message: "Insufficient credits", creditBalance: user.creditBalance });

        }

        const imagepath = req.file.path;  // Assuming the image is uploaded as a file
        const imagefile = fs.createReadStream(imagepath);

        const formdata = new FormData();
        formdata.append('image_file', imagefile);

        const { data } = await axios.post('https://clipdrop-api.co/remove-background/v1', formdata, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API,
            },
            responseType: 'arraybuffer'
        });

        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultimage = `data:${req.file.mimetype};base64,${base64Image}`;

        await userModel.findOneAndUpdate({ clerkId }, { creditBalance: user.creditBalance - 1 });

        res.json({
            success: true,
            resultimage,
            creditBalance: user.creditBalance - 1,
            message: "Background removed successfully",
        });

    } catch (error) {
        console.error("Error removing background:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export default removeBackground;
