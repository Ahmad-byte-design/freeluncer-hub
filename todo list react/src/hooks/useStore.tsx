import {create }from 'zustand'

interface Store {
    list: Array<string>
    create: (inputRef: React.RefObject<HTMLInputElement>) => void
    delete: (index: number) => void
}

export const useStore = create<Store>((set) => ({
 
    list: [],
    create: (inputRef: React.RefObject<HTMLInputElement>) => set((state) => {
        return { list: [...state.list, inputRef.current?.value] };
    }),
    delete: (index: number) => set((state) => ({ list: state.list.filter((_, i) => i !== index) })),
}))


