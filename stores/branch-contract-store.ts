
import { create } from 'zustand';
import { BranchContract, ContractStatus, ContractActivity } from '@/app/[tenantId]/(main)/branchcontract/branch-contract-types';

interface BranchContractStore {
  contracts: BranchContract[];
  activities: Record<number, ContractActivity[]>;
  setContracts: (contracts: BranchContract[]) => void;
  addContract: (contract: BranchContract) => void;
  updateContract: (id: number, contract: Partial<BranchContract>) => void;
  addActivity: (contractId: number, activity: Omit<ContractActivity, "id">) => void;
  updateStatus: (contractId: number, newStatus: ContractStatus, userId: number, userName: string) => void;
}

export const useBranchContractStore = create<BranchContractStore>((set, get) => ({
  contracts: [],
  activities: {},
  setContracts: (contracts) => set({ contracts }),
  addContract: (contract) => 
    set((state) => ({ 
      contracts: [...state.contracts, contract] 
    })),
  updateContract: (id, contract) =>
    set((state) => ({
      contracts: state.contracts.map((item) =>
        item.id === id ? { ...item, ...contract } : item
      ),
    })),
  addActivity: (contractId, activity) =>
    set((state) => ({
      activities: {
        ...state.activities,
        [contractId]: [
          ...(state.activities[contractId] || []),
          { ...activity, id: Date.now() }
        ]
      }
    })),
  updateStatus: (contractId, newStatus, userId, userName) => {
    const contract = get().contracts.find(cont => cont.id === contractId);
    if (!contract) return;

    const oldStatus = contract.Status;

    get().updateContract(contractId, { Status: newStatus });

    get().addActivity(contractId, {
      applicationId: contractId,
      type: "status_change",
      description: `Sözleşme durumu değiştirildi: ${oldStatus} → ${newStatus}`,
      oldStatus,
      newStatus,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString()
    });
  }
}));
