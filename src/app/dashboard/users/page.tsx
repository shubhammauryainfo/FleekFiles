import React from 'react'
import Layout from '@/components/Dashlayout'
import Header from '@/components/Header'
import { getPageMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  getPageMetadata("Users - Fleek Files", "Manage your files and storage.");
const page = () => {
  return (
    <Layout>
    
          <Header title="Users" />
        <div>
            hii
        </div>
        </Layout>
  )
}

export default page