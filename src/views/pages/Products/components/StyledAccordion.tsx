// src/views/pages/Products/components/StyledAccordion.tsx

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionProps,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface StyledAccordionProps extends Omit<AccordionProps, 'children'> {
  accordionTitle: React.ReactNode; // Re-named prop
  children: NonNullable<React.ReactNode>;
  isExpanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
}

const StyledAccordion: React.FC<StyledAccordionProps> = ({
  accordionTitle, // use the new name
  children,
  isExpanded = false,
  onChange,
  ...props
}) => {
  // Generate a unique ID using React's key or other unique properties if available
  // For demonstration, we'll use a simple unique identifier
  const uniqueId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);

  return (
    <Grid container item xs={12} display="block" alignItems="stretch" marginTop={3}>
      <Accordion expanded={isExpanded} onChange={onChange} {...props}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${uniqueId}-content`}
          id={`${uniqueId}-header`}
        >
          {/* Removed Typography wrapper to allow flexible layout */}
          {accordionTitle}
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default StyledAccordion;
