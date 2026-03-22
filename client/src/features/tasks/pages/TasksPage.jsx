import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import { fetchProjects } from '@/features/projects/projectSlice';
import { fetchFeaturesByProject } from '@/features/features/featureSlice';
import {
  fetchTasks,
  createTask,
  updateTask,
  addTaskComment,
  setDetail,
} from '@/features/tasks/taskSlice';
import { ROLES } from '@/constants';

function toInputDate(value) {
  if (value == null || value === '') return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatTableDate(value) {
  if (value == null || value === '') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

function clientCell(row) {
  const c = row.clientId;
  if (c && typeof c === 'object') return c.name || c.code || '—';
  return '—';
}

function projectCell(row) {
  const p = row.projectId;
  if (p && typeof p === 'object') return p.name || '—';
  return '—';
}

function featureCell(row) {
  const f = row.featureId;
  if (f && typeof f === 'object') return f.name || '—';
  return '—';
}

function assigneesCell(row) {
  const list = row.assignees || [];
  if (!list.length) return '—';
  const names = list
    .map((a) => {
      const u = a.userId;
      if (u && typeof u === 'object') {
        const n = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        return n || u.email || null;
      }
      return null;
    })
    .filter(Boolean);
  if (!names.length) return '—';
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxWidth: 280 }}>
      {names.map((label, i) => (
        <Chip key={`${row._id}-a-${i}`} size="small" label={label} variant="outlined" />
      ))}
    </Stack>
  );
}

const employeeCreateSchema = yup.object({
  projectId: yup.string().required('Select a project'),
  featureId: yup.string().required('Select a feature'),
  title: yup.string().required('Title is required'),
  description: yup.string().nullable(),
  status: yup
    .string()
    .oneOf(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'])
    .required(),
  startDate: yup.string().required('Start date is required'),
  dueDate: yup.string().required('End date is required'),
});

const updateSchema = yup.object({
  title: yup.string(),
  description: yup.string().nullable(),
  status: yup.string().oneOf(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']),
  startDate: yup.string().nullable(),
  dueDate: yup.string().nullable(),
});

export default function TasksPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const role = useSelector((s) => s.auth.user?.role);
  const isManagerPlus = [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role);
  const isEmployee = role === ROLES.EMPLOYEE;
  const readOnlyTasks = isManagerPlus;

  const { items, meta, loading } = useSelector((s) => s.tasks);
  const detail = useSelector((s) => s.tasks.detail);
  const projects = useSelector((s) => s.projects.items);
  const featureState = useSelector((s) => s.features);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlProject = searchParams.get('projectId') || '';
  const urlFeature = searchParams.get('featureId') || '';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState(urlProject);
  const [featureFilter, setFeatureFilter] = useState(urlFeature);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const pageTitle = location.pathname.includes('my-tasks') ? 'My tasks' : 'Tasks';

  const employeeCreateForm = useForm({
    resolver: yupResolver(employeeCreateSchema),
    defaultValues: {
      projectId: '',
      featureId: '',
      title: '',
      description: '',
      status: 'TODO',
      startDate: '',
      dueDate: '',
    },
  });

  const updateForm = useForm({
    resolver: yupResolver(updateSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      startDate: '',
      dueDate: '',
    },
  });

  const commentForm = useForm({
    defaultValues: { message: '' },
  });

  const eProjectId = employeeCreateForm.watch('projectId');
  const eFeatureId = employeeCreateForm.watch('featureId');

  const load = useCallback(() => {
    dispatch(
      fetchTasks({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        projectId: projectFilter || undefined,
        featureId: featureFilter || undefined,
      })
    );
  }, [dispatch, page, rowsPerPage, statusFilter, projectFilter, featureFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    dispatch(fetchProjects({ page: 1, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    setProjectFilter(urlProject);
    setFeatureFilter(urlFeature);
  }, [urlProject, urlFeature]);

  useEffect(() => {
    if (eProjectId) {
      dispatch(fetchFeaturesByProject(eProjectId));
    }
  }, [dispatch, eProjectId]);

  const featuresForEmployeeCreate = useMemo(() => {
    if (!eProjectId || featureState.selectedProjectId !== eProjectId) return [];
    return featureState.byProject;
  }, [eProjectId, featureState.byProject, featureState.selectedProjectId]);

  const openCreate = () => {
    employeeCreateForm.reset({
      projectId: urlProject || '',
      featureId: urlFeature || '',
      title: '',
      description: '',
      status: 'TODO',
      startDate: '',
      dueDate: '',
    });
    if (urlProject) {
      dispatch(fetchFeaturesByProject(urlProject));
    }
    setCreateOpen(true);
  };

  const onCreate = async () => {
    const ok = await employeeCreateForm.trigger();
    if (!ok) return;
    const values = employeeCreateForm.getValues();
    try {
      await dispatch(
        createTask({
          featureId: values.featureId,
          title: values.title,
          description: values.description || '',
          status: values.status,
          startDate: values.startDate,
          dueDate: values.dueDate,
        })
      ).unwrap();
      enqueueSnackbar('Task created', { variant: 'success' });
      setCreateOpen(false);
      load();
    } catch (e) {
      enqueueSnackbar(e || 'Failed', { variant: 'error' });
    }
  };

  const openDetail = (t) => {
    dispatch(setDetail(t));
    updateForm.reset({
      title: t.title ?? '',
      description: t.description ?? '',
      status: t.status ?? 'TODO',
      startDate: toInputDate(t.startDate),
      dueDate: toInputDate(t.dueDate),
    });
    setDetailOpen(true);
  };

  const onUpdate = async (values) => {
    if (readOnlyTasks || !detail) return;
    const id = detail._id || detail.id;
    try {
      const body = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined && v !== '')
      );
      if (body.startDate === '') delete body.startDate;
      if (body.dueDate === '') delete body.dueDate;
      await dispatch(updateTask({ id, body })).unwrap();
      enqueueSnackbar('Task updated', { variant: 'success' });
      load();
      setDetailOpen(false);
    } catch (e) {
      enqueueSnackbar(e || 'Update failed', { variant: 'error' });
    }
  };

  const onComment = async ({ message }) => {
    if (readOnlyTasks || !detail || !message?.trim()) return;
    const id = detail._id || detail.id;
    try {
      await dispatch(addTaskComment({ id, message })).unwrap();
      commentForm.reset({ message: '' });
      enqueueSnackbar('Comment added', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e || 'Failed', { variant: 'error' });
    }
  };

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (projectFilter) next.set('projectId', projectFilter);
    if (featureFilter) next.set('featureId', featureFilter);
    setSearchParams(next);
    setPage(0);
    load();
  };

  const columns = useMemo(
    () => [
      { id: 'client', label: 'Client' },
      { id: 'project', label: 'Project' },
      { id: 'feature', label: 'Feature' },
      { id: 'title', label: 'Task' },
      { id: 'startDate', label: 'From' },
      { id: 'dueDate', label: 'To' },
      { id: 'priority', label: 'Priority' },
      { id: 'assignees', label: 'Assigned' },
      { id: 'status', label: 'Status' },
    ],
    []
  );

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
        <div>
          <Typography variant="h4" className="page-title">
            {pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {readOnlyTasks
              ? 'View all tasks in the workspace (read-only). Employees create tasks under a project feature.'
              : 'Create tasks for a feature in your projects. You are set as the assignee so the task appears here.'}
          </Typography>
        </div>
        {isEmployee && (
          <Button variant="contained" onClick={openCreate}>
            New task
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter ?? ''}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="TODO">Todo</MenuItem>
          <MenuItem value="IN_PROGRESS">In progress</MenuItem>
          <MenuItem value="IN_REVIEW">In review</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
          <MenuItem value="BLOCKED">Blocked</MenuItem>
        </TextField>
        <TextField
          select
          label="Project"
          size="small"
          value={projectFilter ?? ''}
          onChange={(e) => setProjectFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All projects</MenuItem>
          {projects.map((p) => (
            <MenuItem key={String(p._id)} value={String(p._id)}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={applyFilters}>
          Apply filters
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
        emptyTitle="No tasks"
        renderRow={(row, rowId) => (
          <TableRow
            key={rowId}
            hover
            onClick={() => openDetail(row)}
            sx={{ cursor: 'pointer' }}
          >
            <TableCell>{clientCell(row)}</TableCell>
            <TableCell>{projectCell(row)}</TableCell>
            <TableCell>{featureCell(row)}</TableCell>
            <TableCell>{row.title}</TableCell>
            <TableCell>{formatTableDate(row.startDate)}</TableCell>
            <TableCell>{formatTableDate(row.dueDate)}</TableCell>
            <TableCell>{row.priority ?? '—'}</TableCell>
            <TableCell>{assigneesCell(row)}</TableCell>
            <TableCell>
              <Chip size="small" label={row.status} />
            </TableCell>
          </TableRow>
        )}
      />

      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New task"
        maxWidth="sm"
        actions={
          <>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={onCreate}>
              Create
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Project"
            fullWidth
            value={eProjectId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              employeeCreateForm.setValue('projectId', v, { shouldValidate: true, shouldDirty: true });
              employeeCreateForm.setValue('featureId', '');
            }}
            error={Boolean(employeeCreateForm.formState.errors.projectId)}
            helperText={employeeCreateForm.formState.errors.projectId?.message}
          >
            <MenuItem value="">Select project</MenuItem>
            {projects.map((p) => (
              <MenuItem key={String(p._id)} value={String(p._id)}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Feature"
            fullWidth
            value={eFeatureId ?? ''}
            onChange={(e) =>
              employeeCreateForm.setValue('featureId', e.target.value, { shouldValidate: true, shouldDirty: true })
            }
            error={Boolean(employeeCreateForm.formState.errors.featureId)}
            helperText={
              employeeCreateForm.formState.errors.featureId?.message ||
              (eProjectId ? 'Features belong to the selected project.' : 'Pick a project first.')
            }
            disabled={!eProjectId}
          >
            <MenuItem value="">Select feature</MenuItem>
            {featuresForEmployeeCreate.map((f) => (
              <MenuItem key={String(f._id)} value={String(f._id)}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Title"
            fullWidth
            {...employeeCreateForm.register('title')}
            error={Boolean(employeeCreateForm.formState.errors.title)}
            helperText={employeeCreateForm.formState.errors.title?.message}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            {...employeeCreateForm.register('description')}
          />
          <TextField
            type="date"
            label="Start date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...employeeCreateForm.register('startDate')}
            error={Boolean(employeeCreateForm.formState.errors.startDate)}
            helperText={employeeCreateForm.formState.errors.startDate?.message}
          />
          <TextField
            type="date"
            label="End date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...employeeCreateForm.register('dueDate')}
            error={Boolean(employeeCreateForm.formState.errors.dueDate)}
            helperText={employeeCreateForm.formState.errors.dueDate?.message}
          />
          <TextField select label="Status" fullWidth {...employeeCreateForm.register('status')}>
            <MenuItem value="TODO">Todo</MenuItem>
            <MenuItem value="IN_PROGRESS">In progress</MenuItem>
            <MenuItem value="IN_REVIEW">In review</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
            <MenuItem value="BLOCKED">Blocked</MenuItem>
          </TextField>
        </Stack>
      </FormModal>

      <FormModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          dispatch(setDetail(null));
        }}
        title={detail?.title || 'Task'}
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setDetailOpen(false)}>Close</Button>
            {!readOnlyTasks && (
              <Button variant="contained" onClick={updateForm.handleSubmit(onUpdate)}>
                Save changes
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              {...updateForm.register('title')}
              disabled={readOnlyTasks}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              {...updateForm.register('description')}
              disabled={readOnlyTasks}
            />
            <TextField
              type="date"
              label="Start date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...updateForm.register('startDate')}
              disabled={readOnlyTasks}
            />
            <TextField
              type="date"
              label="End date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...updateForm.register('dueDate')}
              disabled={readOnlyTasks}
            />
            <TextField select label="Status" fullWidth {...updateForm.register('status')} disabled={readOnlyTasks}>
              <MenuItem value="TODO">Todo</MenuItem>
              <MenuItem value="IN_PROGRESS">In progress</MenuItem>
              <MenuItem value="IN_REVIEW">In review</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
              <MenuItem value="BLOCKED">Blocked</MenuItem>
            </TextField>
            {isManagerPlus && (
              <TextField label="Priority" fullWidth value={detail.priority ?? ''} disabled sx={{ maxWidth: 200 }} />
            )}
            <Divider />
            <Typography variant="subtitle2">Comments</Typography>
            <Stack spacing={1}>
              {(detail.comments || []).map((c) => (
                <Paper key={c._id} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2">{c.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
            {!readOnlyTasks && (
              <form onSubmit={commentForm.handleSubmit(onComment)}>
                <Stack direction="row" spacing={1}>
                  <TextField fullWidth size="small" placeholder="Write a comment…" {...commentForm.register('message')} />
                  <Button type="submit" variant="outlined">
                    Send
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        )}
      </FormModal>
    </Stack>
  );
}
