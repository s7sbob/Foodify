// src/types.ts

export interface TranslationKeys {
  addUserForm: {
    title: string;
    addPilot: string;
    editPilot: string;
    name: string;
    phone: string;
    branch: string;
    isActive: string;
    pilotName: string;
    phoneNumber: string;
    companyName: string;
    branchName: string;
    actions: string;
    pilotList: string;
    status: {
      active: string;
      inactive: string;
      status: string;
    };
  };
  buttons: {
    addPilot: string;
    cancel: string;
    update: string;
    create: string;
  };
  errors: {
    fillAllFields: string;
    fetchBranchesFailed: string;
    submitFailed: string;
    fetchPilotsFailed: string;
  };
  alerts: {
    fetchPilotsFailed: string;
    createPilotSuccess: string;
    updatePilotSuccess: string;
  };
  search: {
    global: string;
    column: string;
  };
}
