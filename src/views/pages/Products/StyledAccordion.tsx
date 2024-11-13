// src/components/StyledAccordion.tsx

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  AccordionProps,
  Grid,
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import { WidthFull } from '@mui/icons-material';

interface StyledAccordionProps extends Omit<AccordionProps, 'children'> {
  title: string;
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
        expandIcon={<IconChevronDown />}
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
