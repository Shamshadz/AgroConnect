import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { SiSellfy } from "react-icons/si";
import { notify } from "../../utils/helper/notification";
import Cart from "../../pages/cart";
import { useCookies } from "react-cookie";
import socket from "../../utils/socket";
import { MessageCircle } from 'lucide-react'; // if using lucide icons
import OpenUserChatsList from "../chat/OpenUserChatsList";

function Navbar() {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies([
    "user_access_token",
    "seller_access_token",
    "brandName",
    "userName"
  ]);

  const userDropdownRef = useRef();
  const sellerDropdownRef = useRef();

  const [openCart, setOpenCart] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [userName, setUserName] = useState("User");
  const [newMessageChatsCount, setNewMessageChatsCount] = useState(0);
  const [openChatPanel, setOpenChatPanel] = useState(false);

  // Check if user is logged in as user or seller
  const isUserLoggedIn = Boolean(cookies.user_access_token);
  const isSellerLoggedIn = Boolean(cookies.seller_access_token);

  useEffect(() => {
    if (cookies.userName) {
      setUserName(cookies.userName);
    }
  }, [cookies.userName]);

  useEffect(() => {
    // Example: Replace with actual logic to fetch the count of active chats with new messages
    const fetchNewMessageChatsCount = () => {
      // Simulate fetching count from a global state or API
      const count = 3; // Replace with actual logic
      setNewMessageChatsCount(count);
    };

    fetchNewMessageChatsCount();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }

      if (
        sellerDropdownRef.current &&
        !sellerDropdownRef.current.contains(event.target)
      ) {
        setShowSellerDropdown(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Listen for chatOpened events from ChatRoom.jsx
    const handleChatOpened = ({ roomId }) => {
      setNewMessageChatsCount((prevCount) => Math.max(prevCount - 1, 0));
    };

    if (socket) {
      socket.on("chatOpened", handleChatOpened);
    }

    return () => {
      if (socket) {
        socket.off("chatOpened", handleChatOpened);
      }
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewActiveChat = (newChat) => {
      console.log("New active chat received in Navbar:", newChat);
      setNewMessageChatsCount((prevCount) => prevCount + 1); // Increment count for new chats
    };

    socket.on("newActiveChat", handleNewActiveChat);

    return () => {
      socket.off("newActiveChat", handleNewActiveChat);
    };
  }, []);

  const handleChatLinkClick = () => {
    setNewMessageChatsCount(0); // Reset the notification count when the Chat link is clicked
  };

  return (
    <nav className="bg-white border-gray-200 shadow">
      <div className="flex flex-wrap items-center justify-between mx-auto px-4 md:px-12 h-12">
        <a href="/" className="flex items-center">
          <span className="text-xl md:text-2xl font-medium whitespace-nowrap">
            <span className="text-red-500 font-bold">A</span>gro
            <span className="text-red-500 font-bold">C</span>onnect
          </span>
        </a>
        <div className="flex flex-row gap-4 md:gap-8 text-2xl md:text-3xl">
          {/* Show User section only if not logged in as seller */}
          {!isSellerLoggedIn && (
            <div
              ref={userDropdownRef}
              className="relative flex flex-row gap-1 justify-center items-center text-blue-700 cursor-pointer"
              onMouseEnter={() => {
                setShowUserDropdown(true);
                setShowSellerDropdown(false);
              }}
              onClick={() => {
                if (!isUserLoggedIn) {
                  navigate("/account/user");
                }
              }}
            >
              <FaUserCircle />
              <span className="text-sm font-medium hidden md:block">
                {isUserLoggedIn ? `Welcome, ${userName}` : "User"}
              </span>
              {isUserLoggedIn && (
                <div
                  className={`absolute ${showUserDropdown ? "block" : "hidden"
                    } top-8 right-0 z-10 font-medium bg-white rounded-lg shadow-md pl-1 md:pl-4 pr-2 md:pr-8 py-0 md:py-2`}
                >
                  <ul className="py-1 md:py-2 flex flex-col text-sm gap-2 text-gray-700 ">
                    <li
                      onClick={() => {
                        navigate("/customerorders");
                      }}
                    >
                      <a className="block px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 whitespace-nowrap">
                        Orders
                      </a>
                    </li>
                    <li
                      onClick={() => {
                        console.log("User log out clicked");
                        setCookie("user_access_token", "", { expires: new Date(0) });
                        setCookie("userName", "", { expires: new Date(0) });
                        notify("User Logged Out", "info");
                        navigate("/");
                      }}
                    >
                      <a className="block text-red-500   rounded  md:hover:bg-transparent md:border-0 md:hover:text-red-700 md:p-0 whitespace-nowrap">
                        Log Out
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Show Seller section only if not logged in as user */}
          {!isUserLoggedIn && (
            <div
              ref={sellerDropdownRef}
              className="relative flex flex-row gap-1 justify-center items-center text-green-700 cursor-pointer"
              onMouseEnter={() => {
                setShowSellerDropdown(true);
                setShowUserDropdown(false);
              }}
              onClick={() => {
                if (!isSellerLoggedIn) {
                  navigate("/account/seller");
                }
              }}
            >
              <SiSellfy />
              <span className="text-sm font-medium hidden md:block">
                {isSellerLoggedIn ? `${cookies.brandName || "Seller"}` : "Seller"}
              </span>
              {isSellerLoggedIn && (
                <div
                  className={`absolute ${showSellerDropdown ? "block" : "hidden"
                    } top-8 right-0 z-10 font-medium bg-white rounded-lg shadow-md pl-1 md:pl-4 pr-2 md:pr-8 py-0 md:py-2`}
                >
                  <ul className="py-2 flex flex-col text-sm gap-2 text-gray-700 ">
                    <li
                      onClick={() => {
                        navigate("/sellerdashboard");
                      }}
                    >
                      <a className="block px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 whitespace-nowrap">
                        Seller Dashboard
                      </a>
                    </li>
                    <li
                      onClick={() => {
                        console.log("Seller log out clicked");
                        setCookie("seller_access_token", "", { expires: new Date(0) });
                        setCookie("brandName", "", { expires: new Date(0) });
                        notify("Seller Logged Out", "info");
                        navigate("/");
                      }}
                    >
                      <a className="block px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 whitespace-nowrap">
                        Seller Logout
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Cart is always visible */}
          <div
            className="flex flex-row gap-1 justify-center items-center text-red-700 cursor-pointer"
            onClick={() => {
              setOpenCart(true);
            }}
          >
            <AiOutlineShoppingCart />
            <span className="text-sm font-medium hidden md:block">Cart</span>
          </div>
          {openCart && <Cart setOpenCart={setOpenCart} />}
          {/* Chat Room link visible only to sellers */}
          {isSellerLoggedIn && (
            <div className="relative flex items-center space-x-2 text-blue-700 hover:text-blue-800 transition-colors cursor-pointer group">
              {/* Icon */}
              <MessageCircle className="w-5 h-5" />

              {/* Text label (only on md and up) */}
              <Link
                to="/chatroom"
                onClick={handleChatLinkClick}
                className="text-sm font-medium hidden md:inline-block group-hover:underline"
              >
                Chat
              </Link>

              {/* Notification badge */}
              {newMessageChatsCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full shadow-lg animate-pulse">
                  {newMessageChatsCount > 9 ? '9+' : newMessageChatsCount}
                </div>
              )}
            </div>
          )}

          {/* Chat Room link visible only to users */}
          {isUserLoggedIn && (
            <div
              className="flex flex-row gap-1 justify-center items-center text-blue-700 cursor-pointer"
              onClick={() => setOpenChatPanel(true)}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium hidden md:block">Chat</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {openChatPanel && (
        <div className="fixed top-0 right-0 h-full w-64 bg-gray-100 shadow-lg z-50">
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Chat Panel</h2>
            <button
              onClick={() => setOpenChatPanel(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <OpenUserChatsList /> {/* Replace with actual chat data */}
        </div>
      )}
    </nav>
  );
}

export default Navbar;