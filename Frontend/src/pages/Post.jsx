import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container,Comment } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";


export default function Post() {
    const [post, setPost] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);    

    useEffect(() => {
        if (id) {
            appwriteService.getPost(id) 
            .then((post) => {
               setPost(post);
            });
        } else navigate("/");
    }, [id, navigate]);

    const isAuthor = post && userData ? post.user._id === userData.data._id : false;

    const deletePost = () => {
        appwriteService.deletePost(post._id).then((status) => {
            if (status) {
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-8">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                    <div className="w-full md:w-1/3 flex justify-center md:mr-6"> 
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="rounded-xl max-w-full h-auto"
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                        <div className="browser-css">
                            {parse(post.content)}
                        </div>
                    </div>
                </div>

                {isAuthor && (
                    <div className="flex justify-end">
                        <Link to={`/edit-post/${post._id}`}>
                            <Button bgColor="bg-green-500" className="mr-3">
                                Edit
                            </Button>
                        </Link>
                        <Button bgColor="bg-red-500" onClick={deletePost}>
                            Delete
                        </Button>
                    </div>
                )}
            </Container>

            {/* Add the CommentSection below */}
            <Comment postId={id} />
        </div>
    ) : null;
}
