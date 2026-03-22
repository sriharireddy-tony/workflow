import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import EditIcon from '@mui/icons-material/Edit';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import Loader from '@/components/common/Loader';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchUsers, createUser, updateUser, fetchUserProjects, clearUserProjects } from '@/features/users/userSlice';

function buildUserSchema(isEdit) {
  return yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    email: yup.string().email().required(),
    password: isEdit
      ? yup.string().transform((v) => (v === '' ? undefined : v)).optional().min(8, 'Min 8 characters')
      : yup.string().min(8, 'Min 8 characters').required(),
    role: yup.string().oneOf(['ADMIN', 'MANAGER', 'EMPLOYEE']).required(),
    status: yup.string().oneOf(['ACTIVE', 'INACTIVE']),
  });
}

export default function UsersPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { items, meta, loading, userProjects, userProjectsLoading } = useSelector((s) => s.users);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [projectsFor, setProjectsFor] = useState(null);

  const load = useCallback(() => {
    dispatch(
      fetchUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: debounced || undefined,
      })
    );
  }, [dispatch, page, rowsPerPage, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const userSchema = useMemo(() => buildUserSchema(Boolean(editUser)), [editUser]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', status: 'ACTIVE' },
  });

  const openCreate = () => {
    setEditUser(null);
    reset({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    reset({
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      password: '',
      role: u.role === 'SUPER_ADMIN' ? 'ADMIN' : u.role ?? 'EMPLOYEE',
      status: u.status ?? 'ACTIVE',
    });
    setModalOpen(true);
  };

  const onSave = async (values) => {
    try {
      if (editUser) {
        const body = { ...values };
        if (!body.password) delete body.password;
        await dispatch(updateUser({ id: editUser._id || editUser.id, body })).unwrap();
        enqueueSnackbar('User updated', { variant: 'success' });
      } else {
        await dispatch(createUser(values)).unwrap();
        enqueueSnackbar('User created', { variant: 'success' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      enqueueSnackbar(e || 'Save failed', { variant: 'error' });
    }
  };

  const openProjects = async (u) => {
    const id = u._id || u.id;
    setProjectsFor(u);
    dispatch(clearUserProjects());
    try {
      await dispatch(fetchUserProjects(id)).unwrap();
    } catch (e) {
      enqueueSnackbar(e || 'Failed to load projects', { variant: 'error' });
    }
  };

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: '' },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
        <div>
          <Typography variant="h4" className="page-title">
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage people in your tenant.
          </Typography>
        </div>
        <Button variant="contained" onClick={openCreate}>
          Add user
        </Button>
      </Stack>

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={meta.total}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(0);
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        emptyTitle="No users match"
        renderRow={(row, rowId) => (
          <TableRow key={rowId} hover>
            <TableCell>
              {row.firstName} {row.lastName}
            </TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>
              <Chip size="small" label={row.role} variant="outlined" />
            </TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => openProjects(row)} title="Projects">
                <FolderOpenIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => openEdit(row)} title="Edit">
                <EditIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        )}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Edit user' : 'New user'}
        actions={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(onSave)}>
              Save
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="First name" {...register('firstName')} error={Boolean(errors.firstName)} helperText={errors.firstName?.message} />
          <TextField label="Last name" {...register('lastName')} error={Boolean(errors.lastName)} helperText={errors.lastName?.message} />
          <TextField label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} disabled={Boolean(editUser)} />
          <TextField
            label={editUser ? 'New password (optional)' : 'Password'}
            type="password"
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
          <TextField select label="Role" {...register('role')} error={Boolean(errors.role)}>
            <MenuItem value="EMPLOYEE">Employee</MenuItem>
            <MenuItem value="MANAGER">Manager</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
          <TextField select label="Status" {...register('status')}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>
        </Stack>
      </FormModal>

      <FormModal
        open={Boolean(projectsFor)}
        onClose={() => {
          setProjectsFor(null);
          dispatch(clearUserProjects());
        }}
        title={projectsFor ? `Projects — ${projectsFor.firstName} ${projectsFor.lastName}` : 'Projects'}
        maxWidth="md"
      >
        {userProjectsLoading ? (
          <Loader />
        ) : (
          <Stack spacing={1} sx={{ pt: 1 }}>
            {userProjects.length === 0 && <Typography color="text.secondary">No project memberships.</Typography>}
            {userProjects.map((p) => (
              <Typography key={p._id}>
                <strong>{p.name}</strong> ({p.key}) — {p.status}
              </Typography>
            ))}
          </Stack>
        )}
      </FormModal>
    </Stack>
  );
}
