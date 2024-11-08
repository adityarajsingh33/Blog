import React, { useEffect, useState } from 'react';
import appwriteService from "../appwrite/config";
import { Container, PostCard } from '../components';
import { useSelector } from 'react-redux';

function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true); 
                const response = await appwriteService.getUserPosts();
               
                if (response && response.data) {
                    setPosts(response.data); 
                } else {
                    setError("No posts found");
                }
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Error fetching posts");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts(); 
    }, []);

    if (loading) {
        return (
            <div className='w-full py-8'>
                <Container>
                    <div className='flex justify-center'>
                        <h2>Loading posts...</h2> 
                    </div>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className='w-full py-8'>
                <Container>
                    <div className='flex justify-center'>
                        <h2>{error}</h2> 
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post._id} className='p-2 w-1/4'>
                                <PostCard {...post} />
                            </div>
                        ))
                    ) : (
                        <div className="p-2 w-full">
                            <h2>No posts available</h2>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}

export default MyPosts;
