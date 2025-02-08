import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Section, Category } from '../types';

export const useSections = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();

    const fetchSections = async () => {
        if (!loading) setLoading(true);
        
        try {
            const [sectionsResponse, categoriesResponse] = await Promise.all([
                api.get(`/api/postgres/list-sections`),
                api.get(`/api/postgres/table-categories`)
            ]);

            if (!sectionsResponse.data.success) {
                throw new Error(sectionsResponse.data.error || 'Bölümler yüklenirken bir hata oluştu');
            }

            if (!categoriesResponse.data.success) {
                throw new Error(categoriesResponse.data.error || 'Kategoriler yüklenirken bir hata oluştu');
            }

            setSections(sectionsResponse.data.data);
            setCategories(categoriesResponse.data.data);
            setError(null);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
            setSections([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, [params.tenantId]);

    return {
        sections,
        categories,
        loading,
        error,
        setError,
        fetchSections
    };
};
