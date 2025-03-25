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
import { userApi } from '../services/api';
import SearchableSelect from './SearchableSelect';

interface UserFormProps {
  user: Partial<User>;
  users: User[];
  onSubmit: (user: Partial<User>) => void;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, users, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = React.useState<Partial<User>>(user);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.added_under_id && formData.leg) {
        const isLegAvailable = await checkLegAvailability(formData.added_under_id, formData.leg);
        if (!isLegAvailable) {
            alert(`${formData.leg === 'Bonus' ? 'Right' : 'Left'} leg is already occupied`);
            return;
        }
    }
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkLegAvailability = async (userId: number, leg: string) => {
    try {
        const response = await userApi.getDownline(userId);
        const downlineUsers = response.data.data || [];
        return !downlineUsers.some(u => u.leg === leg);
    } catch (error) {
        console.error('Failed to check leg availability:', error);
        return false;
    }
  };

  const userOptions = users.map(user => ({
    id: user.id!,
    label: user.name
  }));

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
            <MenuItem value="Bonus">S.A.O. (Bonus - Right Leg)</MenuItem>
            <MenuItem value="Incentive">S.G.O. (Incentive - Left Leg)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <SearchableSelect
            label="Added Under"
            options={userOptions}
            value={formData.added_under_id || ''}
            onChange={(value) => handleChange({
              target: { name: 'added_under_id', value }
            } as React.ChangeEvent<HTMLInputElement>)}
          />
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
            disabled={isEdit}
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