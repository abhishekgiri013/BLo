"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import moment from "moment";
import Modal from "@/components/Modal";
import { deletePhoto } from "@/actions/uploadAction";
import Input from "@/components/Input";
import demoImage from "@/public/img/demo_image.jpg";
import { AiOutlineClose } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";

const ProfileDetails = ({ profile, params }) => {
    const CLOUD_NAME ="dgl2ucjvm";
    const UPLOAD_PRESET ="blog_space_images";

  const [profileToEdit, setProfileToEdit] = useState(profile);
  const [avatarToEdit, setAvatarToEdit] = useState("");

  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, about, designation, age, location } = profileToEdit;

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (avatarToEdit) {
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (avatarToEdit.size > maxSize) {
        setError("File size is too large. Please select a file under 2MB.");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      let profileImg;

      if (avatarToEdit) {
        profileImg = await uploadImage();

        if (profile?.avatar?.id) {
          await deletePhoto(profile?.avatar?.id);
        }
      } else {
        profileImg = profile?.avatar;
      }

      const updateUser = {
        name,
        about,
        designation,
        age,
        location,
        avatar: profileImg,
      };

      const response = await fetch(
        `api/user/${params.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify(updateUser),
        }
      );

      if (response?.status === 200) {
        setSuccess("User updated successfully.");
      } else {
        setError("Error occurred while updating user.");
      }
    } catch (error) {
      console.log(error);
      setError("Error occurred while updating user.");
    } finally {
      setSuccess("");
      setError("");
      setIsLoading(false);
      setOpenModalEdit(false);
      setAvatarToEdit("");
      router.refresh();
    }
  };

  const uploadImage = async () => {
    if (!avatarToEdit) return;

    const formdata = new FormData();

    formdata.append("file", avatarToEdit);
    formdata.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formdata,
        }
      );

      const data = await res.json();
      const image = {
        id: data["public_id"],
        url: data["secure_url"],
      };

      return image;
    } catch (error) {
      console.log(error);
    }
  };

  const timeFormat = () => {
    const timeStr = profile?.createdAt;
    const time = moment(timeStr);
    const formattedTime = time.format("MMMM Do YYYY");

    return formattedTime;
  };

  const handleCancleUploadImage = () => {
    setAvatarToEdit("");
  };

  const handleChange = (event) => {
    setError("");
    const { name, value, type, files } = event.target;

    if (type === "file") {
      setAvatarToEdit(files[0]);
    } else {
      setProfileToEdit((preState) => ({ ...preState, [name]: value }));
    }
  };

  if (!profile) {
    return <span>Access Denied.</span>;
  }

  return (
    <div className="p-3 my-5 container">
      <div className="text-center text-primaryColor pb-20">
        <h2>Profile</h2>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
          <Image
            src={profile?.avatar?.url || demoImage}
            alt="avatar"
            width={200}
            height={10}
            sizes="100vw"
            className="rounded-full  border-black"
          />
        </div>

      <div className=" md:flex-row gap-5">
        <div className=" flex-1 space-y-3">
          <h4 className="flex justify-center text-xl">About Me</h4>
          <span className="flex justify-center text-paragraphColor">{profile?.about}</span>
        </div>
        <br />
        <div className="bg-black border-2">
          
        </div>
<br/>

        <div className=" space-y-5">
          <h4 className="flex justify-center text-xl special-word">Details</h4>

          <div className="flex justify-between space-y-1">
            <span>Email:</span>
            <span>{profile?.email}</span>
          </div>

          <div className="flex justify-between space-y-1">
            <span>Name:</span>
            <span>{profile?.name}</span>
          </div>

          <div className="flex justify-between space-y-1">
            <span>Age:</span>
             <span>{profile?.age}</span>
          </div>

          <div className="flex justify-between space-y-1">
            <span>Location:</span>
            <span>{profile?.location}</span>
          </div>

          <div className="flex justify-between space-y-1">
            <span>Joined:</span>
            <span>{timeFormat()}</span>
          </div>
        </div>
      </div>

      <div className="pt-5 flex items-center ">
        {profile?._id === session?.user?._id && (
          <button
            className="text-primaryColor mr-3 "
            onClick={() => setOpenModalEdit(true)}
          >
           <span >Edit</span>
          </button>
          
        )}
         
        <FaEdit className="text-red-600"/>

        <Modal modalOpen={openModalEdit} setModalOpen={setOpenModalEdit}>
          <form className="w-full space-y-3" onSubmit={handleEditSubmit}>
            <h2 className="text-2xl text-primaryColor pb-3 flex justify-center py-2">Profile</h2>

            {avatarToEdit ? (
              <div className="flex justify-center items-start">
                <Image
                  src={URL.createObjectURL(avatarToEdit)}
                  alt="avatar"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-20 h-20 rounded-full border-2 border-black"
                />

                <button
                  className="text-red-500"
                  onClick={handleCancleUploadImage}
                >
                  <AiOutlineClose />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                {profile?.avatar && profile?.avatar["url"] && (
                  <div>
                    <Image
                      src={profile?.avatar?.url}
                      alt="avatar"
                      width={100}
                      height={0}
                      sizes="100vw"
                      className=" rounded-full border-2 border-black"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <input 
                onChange={handleChange}
                type="file"
                name="newImage"
                accept="image/*"
                className="block w-full border border-gray-300 rounded-lg"
              />
            </div>
           <div className="py-2">

            <Input
              name="name"
              type="text"
              placeholder="name"
              value={profileToEdit?.name || ""}
              onChange={handleChange}
            />

            <Input
              name="designation"
              type="text"
              placeholder="designation"
              value={profileToEdit?.designation || ""}
              onChange={handleChange}
            />

            <Input
              name="about"
              type="text"
              placeholder="about"
              value={profileToEdit?.about || ""}
              onChange={handleChange}
            />

            <Input
              name="age"
              type="text"
              placeholder="age"
              value={profileToEdit?.age || ""}
              onChange={handleChange}
            />

            <Input
              name="location"
              type="text"
              placeholder="location"
              value={profileToEdit?.location || ""}
              onChange={handleChange}
            />
            </div>
            {error && <div className="text-red-700">{error}</div>}

            {success && <div className="text-green-700">{success}</div>}

            <div className=" flex gap-3 space-x-5 py-2 justify-center ">
              <button type="submit" className="btn">
                {isLoading ? "Loading..." : "Update"}
              </button>

              <button
                className="btn bg-red-700"
                onClick={() => setOpenModalEdit(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ProfileDetails;
