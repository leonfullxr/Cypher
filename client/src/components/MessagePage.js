import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Loading from "./Loading";
import backgroundImage from "../assets/background4-transformed.jpeg";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import JSEncrypt from "jsencrypt";

import uploadFile from "../utils/uploadFile";

const MessagePage = () => {
  const recipientParams = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const loggedInUser = useSelector((state) => state?.user);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Public key of the OTHER user (the recipient)
  const [recipientInfo, setRecipientInfo] = useState({
    _id: "",
    name: "",
    profile_pic: "",
    online: false,
    publicKey: ""
  });

  // Public key of the logged-in user (the sender)
  const [myPublicKey, setMyPublicKey] = useState("");

  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  // -------------------------------------------
  // 1) FETCH THE RECIPIENT'S PUBLIC KEY
  // -------------------------------------------
  useEffect(() => {
    const fetchRecipientPublicKey = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/get-public-key`,
          {
            params: { userId: recipientParams.userId }
          }
        );
        const { publicKey } = response.data;
        setRecipientInfo((prev) => ({
          ...prev,
          _id: recipientParams.userId,
          publicKey
        }));
      } catch (error) {
        console.error("Error fetching recipient public key:", error);
      }
    };

    if (recipientParams.userId) {
      fetchRecipientPublicKey();
    }
  }, [recipientParams.userId]);

  // -------------------------------------------
  // 2) FETCH *MY* PUBLIC KEY (the sender)
  // -------------------------------------------
  useEffect(() => {
    const fetchMyPublicKey = async () => {
      try {
        // 'user._id' should be your own user ID from Redux auth state
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/get-public-key`,
          {
            params: { userId: loggedInUser._id }
          }
        );
        setMyPublicKey(response.data.publicKey);
      } catch (error) {
        console.error("Error fetching my public key:", error);
      }
    };

    if (loggedInUser && loggedInUser._id) {
      fetchMyPublicKey();
    }
  }, [loggedInUser]);

  // -------------------------------------------
  // 3) SOCKET LOGIC FOR MESSAGES
  // -------------------------------------------
  useEffect(() => {
    if (!socketConnection) return;

    // Join the chat room for this userId
    socketConnection.emit("message-page", recipientParams.userId);
    // Mark as seen
    socketConnection.emit("seen", recipientParams.userId);

    // We receive basic user info (minus publicKey)
    socketConnection.on("message-user", (data) => {
      setRecipientInfo((prev) => ({
        ...prev,
        name: data.name,
        profile_pic: data.profile_pic,
        online: data.online
      }));
    });

    // Listen for new messages and decrypt them
    socketConnection.on("message", (data) => {
      const localPrivateKey = localStorage.getItem("privateKey") || "";

      const decryptor = new JSEncrypt();
      decryptor.setPrivateKey(localPrivateKey);

      const decryptedMessages = data.map((msg) => {
        let decryptedText = "";

        // If I am the sender, decrypt msg.textForSender
        if (msg.msgByUserId === loggedInUser?._id) {
          decryptedText = decryptor.decrypt(msg.textForSender) || msg.textForSender;
        } else {
          // If the message is from another user, decrypt msg.textForRecipient
          decryptedText = decryptor.decrypt(msg.textForRecipient) || msg.textForRecipient;
        }

        return {
          ...msg,
          text: decryptedText
        };
      });

      setAllMessage(decryptedMessages);
    });
  }, [socketConnection, recipientParams?.userId, loggedInUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessage]);

  // Handle input changes
  const handleOnChange = (e) => {
    const { value } = e.target;
    setMessage((prev) => ({
      ...prev,
      text: value
    }));
  };

  // -------------------------------------------
  // 4) DOUBLE ENCRYPTION BEFORE SENDING
  // -------------------------------------------
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.text && !message.imageUrl && !message.videoUrl) return;

    if (socketConnection) {
      const receiverPublicKey = recipientInfo.publicKey; // The other user's public key
      const senderPublicKey = myPublicKey;          // My own public key

      // Encrypt for the recipient
      let encryptedForRecipient = message.text;
      if (receiverPublicKey) {
        const encryptor = new JSEncrypt();
        encryptor.setPublicKey(receiverPublicKey);
        const encrypted = encryptor.encrypt(message.text);
        if (encrypted) {
          encryptedForRecipient = encrypted;
        }
      }

      // Encrypt for myself (the sender)
      let encryptedForSender = message.text;
      if (senderPublicKey) {
        const encryptor2 = new JSEncrypt();
        encryptor2.setPublicKey(senderPublicKey);
        const encryptedSender = encryptor2.encrypt(message.text);
        if (encryptedSender) {
          encryptedForSender = encryptedSender;
        }
      }

      // Emit to the server with both fields
      socketConnection.emit("new message", {
        sender: loggedInUser?._id,
        receiver: recipientParams.userId,
        textForRecipient: encryptedForRecipient,
        textForSender: encryptedForSender,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        msgByUserId: loggedInUser?._id
      });

      // Clear local state
      setMessage({ text: "", imageUrl: "", videoUrl: "" });
    }
  };

  // Handle uploading images & videos
  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploaded = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage((prev) => ({
      ...prev,
      imageUrl: uploaded.url
    }));
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploaded = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);

    setMessage((prev) => ({
      ...prev,
      videoUrl: uploaded.url
    }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({
      ...prev,
      videoUrl: ""
    }));
  };

  // -------------------------------------------
  // AVATAR MODAL
  // -------------------------------------------
  const handleAvatarClick = () => {
    if (recipientInfo?.profile_pic) {
      setIsAvatarModalOpen(true);
    }
  };  

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
  };

  useEffect(() => { // Close modal on Escape key press
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsAvatarModalOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (e.target.id === "avatar-modal-overlay") {
        setIsAvatarModalOpen(false);
      }
    };

    if (isAvatarModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isAvatarModalOpen]);

  // -------------------------------------------
  // RENDER
  // -------------------------------------------
  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className="bg-no-repeat bg-cover">
      {/* Header */}
      <header className="sticky top-0 h-16 bg-white flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          {/* Avatar Click Image */}
          <div onClick={recipientInfo?.profile_pic ? handleAvatarClick : undefined} className={`relative ${recipientInfo?.profile_pic ? "cursor-pointer hover:shadow-lg transition-shadow duration-300" : ""}`}>
              <Avatar
              width={50}
              height={50}
              imageUrl={recipientInfo?.profile_pic}
              name={recipientInfo?.name}
              userId={recipientInfo?._id}           
            />
            {recipientInfo?.profile_pic && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-bg duration-300"></div>
            )}    
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {recipientInfo?.name}
            </h3>
            <p className="-my-2 text-sm">
              {recipientInfo.online ? (
                <span className="text-primary">online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <button className="cursor-pointer hover:text-primary">
            <HiDotsVertical /> 
            {/* TODO: Add more options here */}
          </button>
        </div>
      </header>

      {/* Messages list */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-1 py-1 my-2 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${loggedInUser._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"
                }`}
            >
              <div className="w-full relative">
                {msg?.imageUrl && (
                  <img src={msg?.imageUrl} alt="" className="w-full h-full object-scale-down" />
                )}
                {msg?.videoUrl && (
                  <video
                    src={msg.videoUrl}
                    className="w-full h-full object-scale-down"
                    controls
                  />
                )}
              </div>
              <p className="px-2">{msg.text}</p>
              <p className="text-xs ml-auto w-fit">
                {moment(msg.createdAt).format("hh:mm")}
              </p>
            </div>
          ))}
        </div>

        {/* Preview image */}
        {message.imageUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600"
              onClick={handleClearUploadImage}
            >
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <img
                src={message.imageUrl}
                alt="uploadImage"
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}

        {/* Preview video */}
        {message.videoUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden">
            <div
              className="w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600"
              onClick={handleClearUploadVideo}
            >
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <video
                src={message.videoUrl}
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
                controls
                muted
                autoPlay
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      {/* Send message section */}
      <section className="h-16 bg-white flex items-center px-4">
        <div className="relative">
          <button
            onClick={handleUploadImageVideoOpen}
            className="flex items-center justify-between w-14 h-14 rounded-full hover:bg-primary hover:text-white"
          >
            <FaPlus size={20} />
          </button>

          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>

                <input
                  type="file"
                  id="uploadImage"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <input
                  type="file"
                  id="uploadVideo"
                  onChange={handleUploadVideo}
                  className="hidden"
                />
              </form>
            </div>
          )}
        </div>

        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type here..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleOnChange}
          />
          <button className="text-secondary hover:text-primary">
            <IoMdSend size={25} />
          </button>
        </form>
      </section>

      {/* Avatar Modal */}
      {isAvatarModalOpen && (
        <div id="avatar-modal-overlay" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative">
            {/* Close button */}
            <button
              className="absolute top-0 right-0 text-white text-2xl p-2 z-10"
              onClick={handleCloseAvatarModal}
            >
              <IoClose size={30} />
            </button>
            {/* Avatar's Image */}
            <img
              src={recipientInfo?.profile_pic}
              alt={`${recipientInfo?.name}'s Avatar`}
              className="max-w-full max-h-full rounded object-contain shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
