import React, { useState } from 'react';
import {
  TextField,
  MenuItem,
  Grid,
  Button,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { User } from '../types';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface UserFormProps {
  user: Partial<User>;
  users: User[];
  onSubmit: (user: Partial<User>) => void;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, users, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = React.useState<Partial<User>>(user);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Leg"
            name="leg"
            value={formData.leg || ''}
            onChange={handleChange}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Bonus">Bonus</MenuItem>
            <MenuItem value="Incentive">Incentive</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Added Under"
            name="added_under_id"
            value={formData.added_under_id || ''}
            onChange={handleChange}
          >
            <MenuItem value="">None</MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mobile No"
            name="mobile_no"
            value={formData.mobile_no || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Work"
            name="work"
            value={formData.work || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formData.remarks || ''}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="User ID"
            name="userid"
            value={formData.userid || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password || ''}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? 'Update User' : 'Add User'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserForm; 