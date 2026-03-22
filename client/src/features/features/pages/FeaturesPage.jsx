import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import FormModal from '@/components/common/FormModal';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { fetchProjects } from '@/features/projects/projectSlice';
import {
  fetchFeaturesByProject,
  createFeature,
  updateFeature,
  assignFeatureUsers,
  clearByProject,
} from '@/features/features/featureSlice';
import { fetchUsers } from '@/features/users/userSlice';
import { ROUTES, ROLES } from '@/constants';

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

function projectNameForFeature(f, fallbackName) {
  const p = f.projectId;
  if (p && typeof p === 'object') return p.name || '—';
  return fallbackName || '—';
}

function assignmentChips(f) {
  const list = f.assignments || [];
  if (!list.length) return <Typography variant="body2" color="text.secondary">—</Typography>;
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxWidth: 320 }}>
      {list.map((a, i) => {
        const u = a.userId;
        const label =
          u && typeof u === 'object'
            ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
            : null;
        if (!label) return null;
        return <Chip key={`${f._id}-a-${i}`} size="small" label={label} variant="outlined" />;
      })}
    </Stack>
  );
}

const featureSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().nullable(),
  status: yup.string().oneOf(['BACKLOG', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  startDate: yup.string().nullable(),
  endDate: yup.string().nullable(),
});

export default function FeaturesPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const role = useSelector((s) => s.auth.user?.role);
  const canManage = [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role);
  const tasksListPath = canManage ? ROUTES.TASKS : ROUTES.MY_TASKS;
  const { items: projects } = useSelector((s) => s.projects);
  const { byProject, byProjectLoading, selectedProjectId } = useSelector((s) => s.features);
  const users = useSelector((s) => s.users.items);
  const [projectId, setProjectId] = useState('');
  const selectedProjectLabel =
    projects.find((p) => String(p._id) === String(projectId))?.name || '';
  const [modalOpen, setModalOpen] = useState(false);
  const [editFeature, setEditFeature] = useState(null);
  const [assignFor, setAssignFor] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(featureSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    dispatch(fetchProjects({ page: 1, limit: 200 }));
  }, [dispatch]);

  const loadFeatures = useCallback(() => {
    if (!projectId) {
      dispatch(clearByProject());
      return;
    }
    dispatch(fetchFeaturesByProject(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const defaultFormValues = {
    name: '',
    description: '',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
  };

  const closeFeatureModal = () => {
    setModalOpen(false);
    setEditFeature(null);
    reset(defaultFormValues);
  };

  const openNewFeature = () => {
    setEditFeature(null);
    reset(defaultFormValues);
    setModalOpen(true);
  };

  const openEditFeature = (f) => {
    setEditFeature(f);
    reset({
      name: f.name ?? '',
      description: f.description ?? '',
      status: f.status ?? 'BACKLOG',
      priority: f.priority ?? 'MEDIUM',
      startDate: toInputDate(f.startDate),
      endDate: toInputDate(f.endDate),
    });
    setModalOpen(true);
  };

  const onSaveFeature = async (values) => {
    try {
      if (editFeature) {
        const id = editFeature._id || editFeature.id;
        await dispatch(
          updateFeature({
            id,
            body: {
              name: values.name,
              description: values.description ?? '',
              status: values.status,
              priority: values.priority,
              startDate: values.startDate || null,
              endDate: values.endDate || null,
            },
          })
        ).unwrap();
        enqueueSnackbar('Feature updated', { variant: 'success' });
      } else {
        if (!projectId) return;
        await dispatch(
          createFeature({
            ...values,
            projectId,
            startDate: values.startDate || undefined,
            endDate: values.endDate || undefined,
          })
        ).unwrap();
        enqueueSnackbar('Feature created', { variant: 'success' });
      }
      closeFeatureModal();
      loadFeatures();
    } catch (e) {
      enqueueSnackbar(e || 'Failed', { variant: 'error' });
    }
  };

  const openAssign = async (f) => {
    setAssignFor(f);
    setSelectedUsers([]);
    try {
      await dispatch(fetchUsers({ page: 1, limit: 200 })).unwrap();
    } catch (e) {
      enqueueSnackbar(e || 'Could not load users', { variant: 'error' });
    }
  };

  const saveAssign = async () => {
    if (!assignFor || !selectedUsers.length) return;
    const fid = assignFor._id || assignFor.id;
    try {
      await dispatch(
        assignFeatureUsers({
          featureId: fid,
          userIds: selectedUsers.map((u) => u._id || u.id),
        })
      ).unwrap();
      enqueueSnackbar('Assignments updated', { variant: 'success' });
      setAssignFor(null);
      loadFeatures();
    } catch (e) {
      enqueueSnackbar(e || 'Assign failed', { variant: 'error' });
    }
  };

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h4" className="page-title">
          Features
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scope work by project, then assign teammates.
        </Typography>
      </div>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <TextField
          select
          label="Project"
          value={projectId ?? ''}
          onChange={(e) => setProjectId(e.target.value)}
          sx={{ minWidth: 280 }}
        >
          <MenuItem value="">Select project</MenuItem>
          {projects.map((p) => (
            <MenuItem key={String(p._id)} value={String(p._id)}>
              {p.name} ({p.key})
            </MenuItem>
          ))}
        </TextField>
        {canManage && (
          <Button variant="contained" disabled={!projectId} onClick={openNewFeature}>
            New feature
          </Button>
        )}
        <Button component={Link} to={tasksListPath} variant="outlined" disabled={!projectId}>
          Open tasks
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {byProjectLoading ? (
          <Loader />
        ) : !projectId ? (
          <EmptyState title="Pick a project" subtitle="Choose a project to load its features." />
        ) : byProject.length === 0 ? (
          <EmptyState title="No features yet" />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>From</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tasks</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {byProject.map((f) => (
                <TableRow key={f._id} hover>
                  <TableCell>{projectNameForFeature(f, selectedProjectLabel)}</TableCell>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={f.status} variant="outlined" />
                  </TableCell>
                  <TableCell>{formatCellDate(f.startDate)}</TableCell>
                  <TableCell>{formatCellDate(f.endDate)}</TableCell>
                  <TableCell>{assignmentChips(f)}</TableCell>
                  <TableCell>{f.priority}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {f.taskCount ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {canManage && (
                      <>
                        <IconButton size="small" onClick={() => openEditFeature(f)} title="Edit feature">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => openAssign(f)} title="Assign people">
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    <Button
                      size="small"
                      component={Link}
                      to={`${tasksListPath}?featureId=${f._id}&projectId=${selectedProjectId || projectId}`}
                    >
                      Tasks
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <FormModal
        open={modalOpen}
        onClose={closeFeatureModal}
        title={editFeature ? 'Edit feature' : 'New feature'}
        actions={
          <>
            <Button onClick={closeFeatureModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(onSaveFeature)}>
              {editFeature ? 'Save changes' : 'Create'}
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Name" {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
          <TextField label="Description" multiline minRows={2} {...register('description')} />
          <TextField select label="Status" {...register('status')}>
            <MenuItem value="BACKLOG">Backlog</MenuItem>
            <MenuItem value="IN_PROGRESS">In progress</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <TextField select label="Priority" {...register('priority')}>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </TextField>
          <TextField
            type="date"
            label="Start date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('startDate')}
          />
          <TextField
            type="date"
            label="End date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('endDate')}
          />
        </Stack>
      </FormModal>

      <FormModal
        open={Boolean(assignFor)}
        onClose={() => setAssignFor(null)}
        title={assignFor ? `Assign — ${assignFor.name}` : 'Assign'}
        actions={
          <>
            <Button onClick={() => setAssignFor(null)}>Cancel</Button>
            <Button variant="contained" onClick={saveAssign} disabled={!selectedUsers.length}>
              Assign
            </Button>
          </>
        }
      >
        <Autocomplete
          multiple
          options={users}
          value={selectedUsers}
          onChange={(_, v) => setSelectedUsers(v)}
          getOptionLabel={(o) => `${o.firstName} ${o.lastName}`}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              {option.firstName} {option.lastName}
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="Users" placeholder="Select" />}
          sx={{ pt: 1 }}
        />
      </FormModal>
    </Stack>
  );
}
