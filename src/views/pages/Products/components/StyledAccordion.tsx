// src/views/pages/Products/components/StyledAccordion.tsx

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  AccordionProps,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface StyledAccordionProps extends Omit<AccordionProps, 'children'> {
  accordionTitle: React.ReactNode; // إعادة تسمية الخاصية
  children: NonNullable<React.ReactNode>;
  isExpanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
}

const StyledAccordion: React.FC<StyledAccordionProps> = ({
  accordionTitle, // استخدام الاسم الجديد
  children,
  isExpanded = false,
  onChange,
  ...props
}) => {
  return (
    <Grid container spacing={3} item xs={12} display="unset" alignItems="stretch" marginTop={3}>
      <Accordion expanded={isExpanded} onChange={onChange} {...props}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${accordionTitle}-content`}
          id={`${accordionTitle}-header`}
        >
          <Typography variant="h6">{accordionTitle}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default StyledAccordion;
