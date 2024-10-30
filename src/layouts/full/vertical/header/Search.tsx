// src/components/Search/Search.tsx

import { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Divider,
  Box,
  List,
  ListItemText,
  Typography,
  TextField,
  ListItemButton,
} from '@mui/material';
import { IconSearch, IconX } from '@tabler/icons-react';
import Menuitems, { MenuitemsType } from '../sidebar/MenuItems';
import { Link } from 'react-router-dom';

const Search = () => {
  const [showDrawer2, setShowDrawer2] = useState(false);
  const [search, setSearch] = useState('');

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  /**
   * Recursively filters the menu items based on the search query.
   * @param routes - Array of menu items to filter.
   * @param query - Search string.
   * @returns Filtered array of menu items.
   */
  const filterRoutes = (routes: MenuitemsType[], query: string): MenuitemsType[] => {
    const filtered: MenuitemsType[] = [];

    routes.forEach((route) => {
      // Check if the current route matches the search query
      const isMatch = route.title
        ? route.title.toLowerCase().includes(query.toLowerCase())
        : false;

      // If the route has children, recursively filter them
      let filteredChildren: MenuitemsType[] | undefined = undefined;
      if (route.children) {
        filteredChildren = filterRoutes(route.children, query);
        if (filteredChildren.length > 0) {
          // Clone the route and assign the filtered children
          filtered.push({ ...route, children: filteredChildren });
        }
      }

      // If the current route matches, add it to the filtered list
      if (isMatch) {
        // If there are already filtered children, merge them
        if (filteredChildren) {
          filtered.push({ ...route, children: filteredChildren });
        } else {
          filtered.push(route);
        }
      }
    });

    return filtered;
  };

  // Determine the data to display based on the search query
  const searchData = search ? filterRoutes(Menuitems, search) : Menuitems;

  return (
    <>
      <IconButton
        aria-label="search"
        color="inherit"
        onClick={() => setShowDrawer2(true)}
        size="large"
      >
        <IconSearch size="16" />
      </IconButton>
      <Dialog
        open={showDrawer2}
        onClose={handleDrawerClose2}
        fullWidth
        maxWidth="sm"
        aria-labelledby="search-dialog-title"
        aria-describedby="search-dialog-description"
        PaperProps={{ sx: { position: 'fixed', top: 30, m: 0 } }}
      >
        <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              id="tb-search"
              placeholder="Search here"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              inputProps={{ 'aria-label': 'Search here' }}
            />
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <Box p={2} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          <Typography variant="h5" p={1}>
            Quick Page Links
          </Typography>
          <List component="nav">
            {searchData.map((menu) => (
              <Box key={menu.id}>
                {/* Display subheader if present and no title */}
                {menu.navlabel && menu.subheader && (
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    {menu.subheader}
                  </Typography>
                )}

                {/* Display menu item without children */}
                {menu.title && !menu.children && !menu.navlabel && (
                  <ListItemButton
                    sx={{ py: 0.5, px: 1 }}
                    to={menu.href || '#'}
                    component={Link}
                  >
                    <ListItemText
                      primary={menu.title}
                      secondary={menu.href}
                      sx={{ my: 0, py: 0.5 }}
                    />
                  </ListItemButton>
                )}

                {/* Display menu items with children */}
                {menu.children && (
                  <Box sx={{ pl: 2 }}>
                    {menu.children.map((child) => (
                      <Box key={child.id}>
                        {/* Display subheaders within children if any */}
                        {child.navlabel && child.subheader && (
                          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                            {child.subheader}
                          </Typography>
                        )}

                        {/* Recursive rendering for deeper nested children */}
                        {child.title && !child.children && (
                          <ListItemButton
                            sx={{ py: 0.5, px: 1 }}
                            to={child.href || '#'}
                            component={Link}
                          >
                            <ListItemText
                              primary={child.title}
                              secondary={child.href}
                              sx={{ my: 0, py: 0.5 }}
                            />
                          </ListItemButton>
                        )}

                        {child.children && (
                          <Box sx={{ pl: 2 }}>
                            {child.children.map((grandChild) => (
                              <ListItemButton
                                sx={{ py: 0.5, px: 1 }}
                                to={grandChild.href || '#'}
                                component={Link}
                                key={grandChild.id}
                              >
                                <ListItemText
                                  primary={grandChild.title}
                                  secondary={grandChild.href}
                                  sx={{ my: 0, py: 0.5 }}
                                />
                              </ListItemButton>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}

            {/* Optional: Handle cases where no results are found */}
            {search && searchData.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                No results found.
              </Typography>
            )}
          </List>
        </Box>
      </Dialog>
    </>
  );
};

export default Search;
