import React from 'react';
import { FinishingModule } from './FinishingModule';

// Backwards-compatibility re-export: Finishing and QC are now split into separate modules (FinishingModule & QualityControlModule)
export const FinishingQCModule = (props) => {
  return <FinishingModule {...props} />;
};
export default FinishingQCModule;
