import { v2 as cloudinary} from "cloudinary"
import fs from "fs" 
import dotenv from "dotenv"

dotenv.config()

        
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
      // console.log("Local File Path:", localFilePath);
  
      if (!localFilePath) {
        // console.log("File path is empty, returning null.");
        return null;
      } else {
        // console.log("Local file path is present.");
      }
  
      // console.log("Attempting to upload to Cloudinary...");
  
      // Upload the file to Cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
  
      // console.log("Cloudinary Response:", response);
  
      if (!response) {
        console.log("Cloudinary upload returned null.");
      } else {
        console.log("File uploaded successfully:", response.url);
      }
  
      return response;
  
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the operation got failed
      
    }
  };
  

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" }, 
//     function(error, result) {console.log(result); });

export {uploadOnCloudinary}