
'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

import { styles } from './navBarStyles';

export default function TopNav() {
  return (
    <Box component="nav" sx={styles.navbarContainer}>
      <Box sx={styles.contentWrapper}>
        {/* Contact Information */}
        <Box sx={styles.contactInfo}>
          <Box sx={styles.contactItem}>
            <IconButton size="small" sx={styles.iconButton}>
              <PhoneIcon />
            </IconButton>
            <Typography variant="body2" sx={styles.contactText}>
              +1234567890
            </Typography>
          </Box>
          
          <Box sx={styles.contactItem}>
            <IconButton size="small" sx={styles.iconButton}>
              <EmailIcon />
            </IconButton>
            <Typography variant="body2" sx={styles.contactText}>
              test@gmail.com
            </Typography>
          </Box>
        </Box>

        {/* Social Icons */}
        <Box sx={styles.socialIcons}>
          <IconButton sx={styles.iconButton} aria-label="Facebook">
            <FacebookIcon />
          </IconButton>
          <IconButton sx={styles.iconButton} aria-label="Instagram">
            <InstagramIcon />
          </IconButton>
          <IconButton sx={styles.iconButton} aria-label="Twitter">
            <TwitterIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}