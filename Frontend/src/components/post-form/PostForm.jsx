import React from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "../index";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            tags: post?.tags || "",
            content: post?.content || "",
            status: post?.status ? "active" : "inactive", // Map boolean to string
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
    
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (post && key === 'coverImage') return;
    
            if (key === 'status') {
                formData.append(key, value === 'active' ? 'true' : 'false');
            } else if (key === 'coverImage') {
                if (!post) {
                    formData.append(key, value[0]); // Append the actual file object
                }
            } else {
                formData.append(key, value);
            }
        });
    
        if (post) {
            try {
                const dbPost = await appwriteService.updatePost(post._id, formData);
                if (dbPost) {
                    navigate(`/post/${dbPost._id}`);
                }
            } catch (error) {
                console.error("Error updating the post:", error);
            }
        } else {
            const dbPost = await appwriteService.createPost(formData);
            if (dbPost) {
                navigate(`/all-posts`);
            }
        }
    };
    

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="flex flex-wrap p-6 bg-white rounded-lg shadow-md border border-gray-300"
        >
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />

                <Input
                    label="Tags :"
                    placeholder="Blog,creative..."
                    className="mb-4"
                    {...register("tags", { required: true })}
                />

                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
               
                {post ?(
                    <div className="w-full mb-4">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="rounded-lg shadow-md"
                        />
                    </div>
                ):(
                    <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("coverImage", { required: true })}
                />
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button
                    type="submit"
                    bgColor={post ? "bg-green-500" : undefined}
                    className="w-full hover:bg-green-600 transition duration-200"
                >
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
