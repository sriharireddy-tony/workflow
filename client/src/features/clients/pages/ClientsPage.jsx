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
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import EditIcon from '@mui/icons-material/Edit';
import DataTable from '@/components/common/DataTable';
import FormModal from '@/components/common/FormModal';
import Loader from '@/components/common/Loader';
import { useDebounce } from '@/hooks/useDebounce';
import {
  fetchClients,
  createClient,
  updateClient,
  fetchClientProjects,
  clearClientProjects,
} from '@/features/clients/clientSlice';

const schema = yup.object({
  name: yup.string().required(),
  code: yup.string().required(),
  contactPerson: yup.string().transform((v) => v || undefined).optional(),
  email: yup
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .email('Invalid email')
    .optional(),
  phone: yup.string().transform((v) => v || undefined).optional(),
  status: yup.string().oneOf(['ACTIVE', 'INACTIVE']),
});

export default function ClientsPage() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { items, meta, loading, clientProjects, clientProjectsLoading } = useSelector((s) => s.clients);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [projectsFor, setProjectsFor] = useState(null);

  const load = useCallback(() => {
    dispatch(
      fetchClients({
        page: page + 1,
        limit: rowsPerPage,
        search: debounced || undefined,
      })
    );
  }, [dispatch, page, rowsPerPage, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', code: '', contactPerson: '', email: '', phone: '', status: 'ACTIVE' },
  });

  const openCreate = () => {
    setEdit(null);
    reset({ name: '', code: '', contactPerson: '', email: '', phone: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEdit(c);
    reset({
      name: c.name ?? '',
      code: c.code ?? '',
      contactPerson: c.contactPerson ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      status: c.status ?? 'ACTIVE',
    });
    setModalOpen(true);
  };

  const onSave = async (values) => {
    try {
      if (edit) {
        await dispatch(updateClient({ id: edit._id || edit.id, body: values })).unwrap();
        enqueueSnackbar('Client updated', { variant: 'success' });
      } else {
        await dispatch(createClient(values)).unwrap();
        enqueueSnackbar('Client created', { variant: 'success' });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      enqueueSnackbar(e || 'Save failed', { variant: 'error' });
    }
  };

  const openProjects = async (c) => {
    const id = c._id || c.id;
    setProjectsFor(c);
    dispatch(clearClientProjects());
    try {
      await dispatch(fetchClientProjects(id)).unwrap();
    } catch (e) {
      enqueueSnackbar(e || 'Failed to load projects', { variant: 'error' });
    }
  };

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'code', label: 'Code' },
    { id: 'contact', label: 'Contact' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: '' },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
        <div>
          <Typography variant="h4" className="page-title">
            Clients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organizations you deliver work for.
          </Typography>
        </div>
        <Button variant="contained" onClick={openCreate}>
          Add client
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
        emptyTitle="No clients"
        renderRow={(row, rowId) => (
          <TableRow key={rowId} hover>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.code}</TableCell>
            <TableCell>{row.contactPerson || '—'}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => openProjects(row)}>
                <FolderOpenIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => openEdit(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        )}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={edit ? 'Edit client' : 'New client'}
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
          <TextField label="Name" {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
          <TextField label="Code" {...register('code')} error={Boolean(errors.code)} helperText={errors.code?.message} disabled={Boolean(edit)} />
          <TextField label="Contact person" {...register('contactPerson')} />
          <TextField label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField label="Phone" {...register('phone')} />
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
          dispatch(clearClientProjects());
        }}
        title={projectsFor ? `Projects — ${projectsFor.name}` : 'Projects'}
        maxWidth="md"
      >
        {clientProjectsLoading ? (
          <Loader />
        ) : (
          <Stack spacing={1} sx={{ pt: 1 }}>
            {clientProjects.length === 0 && <Typography color="text.secondary">No projects for this client.</Typography>}
            {clientProjects.map((p) => (
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
