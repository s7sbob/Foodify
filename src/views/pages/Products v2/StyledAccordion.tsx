// src/views/pages/Products/StyledAccordion.tsx

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
  title: any;
  children: NonNullable<React.ReactNode>;
}

const StyledAccordion: React.FC<StyledAccordionProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <Grid container spacing={3} item xs={12} display="unset" alignItems="stretch" marginTop={3}>
      <Accordion {...props}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${title}-content`}
          id={`${title}-header`}
        >
          <Typography variant="h6">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default StyledAccordion;
