import { useEffect, useState, useCallback } from 'react';
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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import Loader from '@/components/common/Loader';
import {
  fetchProjects,
  createProject,
  updateProject,
  fetchProjectMembers,
  addProjectMembers,
  clearMembers,
} from '@/features/projects/projectSlice';
import { fetchClients } from '@/features/clients/clientSlice';
import { fetchUsers } from '@/features/users/userSlice';
import { ROLES } from '@/constants';

function toInputDate(value) {
  if (value == null || value === '') return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatCellDate(value) {
  if (value == null || value === '') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

function clientDisplayName(row) {
  const c = row.clientId;
  if (c && typeof c === 'object') return c.name || c.code || '—';
  return '—';
}

function memberChips(row) {
  const list = row.members || [];
  if (!list.length) return '—';
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxWidth: 280 }}>
      {list.map((m, i) => {
        const u = m.userId;
        const label =
          u && typeof u === 'object'
            ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
            : null;
        if (!label) return null;
        return <Chip key={`${row._id}-m-${i}`} size="small" label={label} variant="outlined" />;
      })}
    </Stack>
  );
}

const projectSchema = yup.object({
  clientId: yup.string().required(),
  name: yup.string().required(),
  key: yup.string().required(),
  description: yup.string().nullable(),
  status: yup.string().oneOf(['PLANNING', 'ACTIVE', 'ON_HOLD', 'DONE']),
  startDate: yup.string().nullable(),
  endDate: yup.string().nullable(),
});

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const role = useSelector((s) => s.auth.user?.role);
  const canEditProjects = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(role);
  const { items, meta, loading, members, membersLoading } = useSelector((s) => s.projects);
  const clients = useSelector((s) => s.clients.items);
  const users = useSelector((s) => s.users.items);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [membersFor, setMembersFor] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const load = useCallback(() => {
    dispatch(
      fetchProjects({
        page: page + 1,
        limit: rowsPerPage,
      })
    );
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (canEditProjects) {
      dispatch(fetchClients({ page: 1, limit: 200 }));
    }
  }, [dispatch, canEditProjects]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      clientId: '',
      name: '',
      key: '',
      description: '',
      status: 'PLANNING',
    },
  });

  const clientId = watch('clientId');

  const openCreate = () => {
    setEdit(null);
    const firstClientId = clients[0]?._id != null ? String(clients[0]._id) : '';
    reset({
      clientId: firstClientId,
      name: '',
      key: '',
      description: '',
      status: 'PLANNING',
      startDate: '',
      endDate: '',
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEdit(p);
    const rawClient = p.clientId;
    const clientIdStr =
      rawClient != null ? String(typeof rawClient === 'object' ? rawClient._id : rawClient) : '';
    reset({
      clientId: clientIdStr,
      name: p.name ?? '',
      key: p.key ?? '',
      description: p.description ?? '',
      status: p.status ?? 'PLANNING',
      startDate: toInputDate(p.startDate),
      endDate: toInputDate(p.endDate),
    });
    setModalOpen(true);
  };

  const onSave = async (values) => {
    try {
      const body = {
        ...values,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      };
      if (edit) {
        await dispatch(updateProject({ id: edit._id || edit.id, body })).unwrap();
        enqueueSnackbar('Project updated', { variant: 'success' });
      } else {
        await dispatch(createProject(body)).unwrap();
        enqueueSnackbar('Project created', { variant: 'success' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      enqueueSnackbar(e || 'Save failed', { variant: 'error' });
    }
  };

  const openMembers = async (p) => {
    setMembersFor(p);
    setSelectedUsers([]);
    dispatch(clearMembers());
    try {
      await dispatch(fetchUsers({ page: 1, limit: 200 })).unwrap();
      await dispatch(fetchProjectMembers(p._id || p.id)).unwrap();
    } catch (e) {
      enqueueSnackbar(e || 'Failed to load members', { variant: 'error' });
    }
  };

  const saveMembers = async () => {
    if (!membersFor || selectedUsers.length === 0) return;
    const pid = membersFor._id || membersFor.id;
    const payload = {
      projectId: pid,
      members: selectedUsers.map((u) => ({
        userId: u._id || u.id,
        roleInProject: 'MEMBER',
        allocationPercent: 100,
      })),
    };
    try {
      await dispatch(addProjectMembers(payload)).unwrap();
      enqueueSnackbar('Members added', { variant: 'success' });
      setSelectedUsers([]);
      await dispatch(fetchProjectMembers(pid)).unwrap();
      load();
    } catch (e) {
      enqueueSnackbar(e || 'Failed to add members', { variant: 'error' });
    }
  };

  const columns = [
    { id: 'client', label: 'Client' },
    { id: 'name', label: 'Project' },
    { id: 'key', label: 'Key' },
    { id: 'status', label: 'Status' },
    { id: 'startDate', label: 'From' },
    { id: 'endDate', label: 'End' },
    { id: 'members', label: 'Members' },
    { id: 'features', label: 'Features' },
    ...(canEditProjects ? [{ id: 'actions', label: '' }] : []),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
        <div>
          <Typography variant="h4" className="page-title">
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Delivery units linked to clients.
          </Typography>
        </div>
        {canEditProjects && (
          <Button variant="contained" onClick={openCreate} disabled={!clients.length}>
            New project
          </Button>
        )}
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
        emptyTitle="No projects"
        renderRow={(row, rowId) => (
          <TableRow key={rowId} hover>
            <TableCell>{clientDisplayName(row)}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>
              <Chip size="small" label={row.key} variant="outlined" />
            </TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{formatCellDate(row.startDate)}</TableCell>
            <TableCell>{formatCellDate(row.endDate)}</TableCell>
            <TableCell>{memberChips(row)}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {row.featureCount ?? 0}
              </Typography>
            </TableCell>
            {canEditProjects && (
              <TableCell align="right">
                <IconButton size="small" onClick={() => openMembers(row)} title="Manage members">
                  <GroupAddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => openEdit(row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            )}
          </TableRow>
        )}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={edit ? 'Edit project' : 'New project'}
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
          <TextField
            select
            label="Client"
            value={clientId ?? ''}
            onChange={(e) => setValue('clientId', e.target.value, { shouldValidate: true })}
            error={Boolean(errors.clientId)}
            helperText={errors.clientId?.message}
          >
            {clients.map((c) => (
              <MenuItem key={String(c._id)} value={String(c._id)}>
                {c.name} ({c.code})
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Name" {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
          <TextField label="Key" {...register('key')} error={Boolean(errors.key)} helperText={errors.key?.message} />
          <TextField label="Description" multiline minRows={2} {...register('description')} />
          <TextField select label="Status" {...register('status')}>
            <MenuItem value="PLANNING">Planning</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="ON_HOLD">On hold</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
          </TextField>
          <TextField
            type="date"
            label="Start date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            {...register('startDate')}
          />
          <TextField
            type="date"
            label="End date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            {...register('endDate')}
          />
        </Stack>
      </FormModal>

      <FormModal
        open={Boolean(membersFor)}
        onClose={() => {
          setMembersFor(null);
          dispatch(clearMembers());
        }}
        title={membersFor ? `Members — ${membersFor.name}` : 'Members'}
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setMembersFor(null)}>Close</Button>
            <Button variant="contained" onClick={saveMembers} disabled={!selectedUsers.length}>
              Add selected
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Autocomplete
            multiple
            options={users}
            value={selectedUsers}
            onChange={(_, v) => setSelectedUsers(v)}
            getOptionLabel={(o) => `${o.firstName} ${o.lastName} (${o.email})`}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox style={{ marginRight: 8 }} checked={selected} />
                {option.firstName} {option.lastName}
              </li>
            )}
            renderInput={(params) => <TextField {...params} label="Add users" placeholder="Search" />}
          />
          <Typography variant="subtitle2">Current members</Typography>
          {membersLoading ? (
            <Loader />
          ) : (
            <Stack spacing={0.5}>
              {members.length === 0 && <Typography color="text.secondary">No members yet.</Typography>}
              {members.map((m) => {
                const u = m.userId;
                const name =
                  typeof u === 'object' && u
                    ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                    : String(u);
                return (
                  <Typography key={String(m.userId?._id || m.userId)}>
                    {name || 'User'} — {m.roleInProject}
                  </Typography>
                );
              })}
            </Stack>
          )}
        </Stack>
      </FormModal>
    </Stack>
  );
}
