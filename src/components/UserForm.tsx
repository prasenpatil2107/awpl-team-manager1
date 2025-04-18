import React, { useState } from 'react';
import {
  TextField,
  MenuItem,
  Grid,
  Button,
  Box,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { User } from '../types';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { userApi } from '../services/api';
import SearchableSelect from './SearchableSelect';

interface UserFormProps {
  user: Partial<User>;
  users: User[];
  onSubmit: (data: Partial<User>) => void;
  isEdit?: boolean;
}

interface UserFormData {
  name: string;
  leg: string;  // This allows for empty string in the form
  added_under_id: number;
  mobile_no: string;
  address: string;
  work: string;
  remarks: string;
  userid: string;
  password: string;
  sp_value: number;
  is_green: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, users, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = React.useState<UserFormData>({
    name: user.name || '',
    leg: user.leg || '',
    added_under_id: user.added_under_id || 0,
    mobile_no: user.mobile_no || '',
    address: user.address || '',
    work: user.work || '',
    remarks: user.remarks || '',
    userid: user.userid || '',
    password: user.password || '',
    sp_value: user.sp_value || 0,
    is_green: user.is_green || false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.added_under_id && formData.leg) {
      try {
        const response = await userApi.getDownline(formData.added_under_id);
        const downlineUsers = response.data.data || [];
        
        const isLegOccupied = downlineUsers.some(downlineUser => 
          downlineUser.leg === formData.leg && downlineUser.id !== user.id
        );

        if (isLegOccupied) {
          alert(`${formData.leg === 'Bonus' ? 'Right' : 'Left'} leg is already occupied`);
          return;
        }
      } catch (error) {
        console.error('Error checking leg availability:', error);
        alert('Error checking leg availability');
        return;
      }
    }

    const userData: Partial<User> = {
      ...formData,
      leg: formData.leg === '' ? null : formData.leg as 'Bonus' | 'Incentive',
      added_under_id: formData.added_under_id || undefined,
      mobile_no: formData.mobile_no || undefined,
      address: formData.address || undefined,
      work: formData.work || undefined,
      remarks: formData.remarks || undefined,
      userid: formData.userid || undefined,
      password: formData.password || undefined,
      sp_value: formData.sp_value,
      is_green: formData.is_green
    };

    onSubmit(userData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const userOptions = users.map(user => ({
    id: user.id!,
    label: user.name
  }));

  const handleAddedUnderChange = (value: number | '') => {
    setFormData(prev => ({
      ...prev,
      added_under_id: value || 0
    }));
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
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Leg"
            name="leg"
            value={formData.leg}
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
            onChange={handleAddedUnderChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mobile No"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
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
            value={formData.work}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formData.remarks}
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
            value={formData.userid}
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
            value={formData.password}
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
          <TextField
            label="SP Value"
            type="number"
            value={formData.sp_value}
            onChange={(e) => setFormData({ ...formData, sp_value: parseFloat(e.target.value) || 0 })}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_green}
                onChange={(e) => setFormData({ ...formData, is_green: e.target.checked })}
                color="primary"
              />
            }
            label="Green Status"
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