import conf from '../conf/conf.js';
import axios from "axios"

export class AuthService {
   
    async createAccount({ email, password, username, fullname, profileImage }) {
        try {
          // Create a FormData object to send files and form data
          const formData = new FormData();
      
          // Use a loop to add all fields dynamically
          const fields = { email, password, username, fullname };
          Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
      
          // Append profile image separately
          formData.append("profileImage", profileImage[0]);
      
          // Send the POST request with FormData
          const userAccount = await axios.post('/api/v1/users/register', formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
      
          if (userAccount) {
            console.log("account created");
            
          } else {
            return userAccount;
          }
        } catch (error) {
          throw error;
        }
      }
      

    async login({email, password}) {
        try {
            return await axios.post('/api/v1/users/login', {
        email,
        password,
      });
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const response= await axios.get('/api/v1/users/currentUser')
            return response.data
        } catch (error) {
            console.log("getCurrentUser :: error", error);
        }

        return null;
    }

    async logout() {

        try {
            await axios.post('/api/v1/users/logout');
        } catch (error) {
            console.log("Appwrite serive :: logout :: error", error);
        }
    }
}

const authService = new AuthService();

export default authService


