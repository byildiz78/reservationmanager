import { testConnection } from "@/lib/postgre";
import { NextApiRequest, NextApiResponse } from "next";
import { extractTenantId } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const tenantId = extractTenantId(req);
    if (!tenantId) {
        return res.status(400).json({ success: false, error: 'Tenant ID is required' });
    }

    try {
        const result = await testConnection();
        return res.status(200).json({ success: result });
    } catch (error) {
        console.error("DB Test Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: (error as Error).message 
        });
    }
}
