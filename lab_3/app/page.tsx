'use client';

import { useState } from 'react';
import AddPostForm from '@/components/AddPostForm';
import PostList from '@/components/PostList';

export default function Home() {
  const [refetchKey, setRefetchKey] = useState(0);

  const handleDataChange = () => {
    setRefetchKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-12">
      <AddPostForm onPostAdded={handleDataChange} />

      <hr className="border-gray-700" />

      <PostList refetchKey={refetchKey} />
    </div>
  );
}