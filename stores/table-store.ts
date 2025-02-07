            console.error('Update Table Error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
