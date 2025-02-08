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
        try {
            const [sectionsResponse, categoriesResponse] = await Promise.all([
                api.get(`/api/postgres/list-sections`),
                api.get(`/api/postgres/table-categories`)
            ]);

            const sectionsData = await sectionsResponse.data;
            const categoriesData = await categoriesResponse.data;
            
            if (sectionsData.success) {
                setSections(sectionsData.data);
            } else {
                setError(sectionsData.error || 'Bölümler yüklenirken bir hata oluştu');
            }
            
            if (categoriesData.success) {
                setCategories(categoriesData.data);
            } else {
                setError(categoriesData.error || 'Kategoriler yüklenirken bir hata oluştu');
            }
        } catch (error) {
            setError('Veriler yüklenirken bir hata oluştu');
            console.error('Fetch Error:', error);
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
