import React from 'react';
import { Container, Logo, LogoutBtn } from '../index';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  
  const navigate = useNavigate();
  const location = useLocation(); 

  const navItems = [
    { name: 'Home', slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "All Posts", slug: "/all-posts", active: authStatus },
    { name: "My Posts", slug: "/my-posts", active: authStatus },
    { name: "Add Post", slug: "/add-post", active: authStatus },
  ];

  return (
    <header className='py-3 shadow-md' style={{backgroundColor : "transparent"}}>
      <Container>
        <nav className='flex items-center'>

        <div className='mr-4'>
          {userData && userData.data ? (
            <p className='text-lg font-semibold'>Welcome, {userData.data.username}</p>
          ) : (
            <p className='text-lg font-semibold'>Welcome, Guest</p>
          )}
        </div>

          

          <ul className='flex space-x-6 ml-auto'>
            {navItems.map((item) => 
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className={`px-4 font-semibold py-2 text-white duration-200 rounded-md 
                      ${location.pathname === item.slug ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white'}`}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}

            {/* Logout Button */}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
