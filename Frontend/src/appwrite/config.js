import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";
import axios from "axios"


export class Service{
    client = new Client();
    databases;
    bucket;
    
    constructor(){
        this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost(formData) {
        try {
            // Set content-type to multipart/form-data for file uploads
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };
            const response = await axios.post("/api/v1/users/create-post", formData, config);
            return response.data;
        } catch (error) {
            console.log("Error in createPost:", error);
            throw error;
        }
    }

    async updatePost(id,formdata){
        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };
            console.log("sending the data ");
            
            const response= await axios.patch(`/api/v1/users/update/${id}`,formdata,config)
            // console.log(response.data);
            
            return response.data;

        } catch (error) {
            console.log(" :: updatePost :: error", error);
        }
    }

    async deletePost(id){
        try {
           await axios.delete(`/api/v1/users/delete/${id}`)
            return true
        } catch (error) {
            console.log("Appwrite serive :: deletePost :: error", error);
            return false
        }
    }

    async getPost(id){
        try {
           const response=await axios.get(`/api/v1/users/${id}`)
           return response.data
        } catch (error) {
            console.log("Appwrite serive :: getPost :: error", error);
            return false
        }
    }

    async getPosts(){
        try {
            return await axios.get("/api/v1/users/all-posts")
        } catch (error) {
            console.log("Appwrite serive :: getPosts :: error", error);
            return false
        }
    }


    async getUserPosts(){
        try {
        
            
            const response = await axios.get("/api/v1/users/user-posts")
            return response

        } catch (error) {
            console.log(" :: getPosts :: error", error);
            return false
        }
    }

    async toggleLike(id){
        try {
            const response=await axios.put(`/api/v1/users/${id}/like`)
            return response.data
        } catch (error) {
            console.log("like error",error);
            return false
            
        }
    }

    async getPostLikes(id){
        try {

            const response=await axios.get(`/api/v1/users/${id}/like`)            
            return response.data
            
        } catch (error) {
            console.log("post error",error);
            return false
            
        }
    }

    async addComment(postId,content,parentId=""){
        try {
            console.log(content);
            console.log(postId);
            
            const response =await axios.post("/api/v1/users/add-comment",{
                content,
                postId,
                parentId
            })
            // console.log("response",response.data);
            
            return response.data.data
        } catch (error) {
            console.error("Commment error",error);
            
        }
    }

    async getComments(id){
        try {            
            const response =await axios.get(`/api/v1/users/comment/${id}`)
            // console.log("response",response.data);
            
            return response.data
        } catch (error) {
            console.error("Commment error",error);
            
        }
    }

   
}


const service = new Service()
export default service