import React from 'react';
import ProfileForm from '../components/auth/ProfileForm';
import '../styles/profile.css';

const Profile = () => {
    return (
        <div className="profile-container">
            <h1>Your Profile</h1>
            <ProfileForm />
        </div>
    );
};

export default Profile;