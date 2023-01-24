import Image from "next/image";
import { Image as Logo } from "iconsax-react";
import {
  ButtonAdd,
  ButtonSave,
  ButtonCancel,
} from "../../../app/components/elements/Buttons";
import { Container } from "../../../app/components/elements/Containers";
import { Title } from "../../../app/components/elements/Title";

import { ModalConfirmDelete, ModalLg } from "../../../app/components/modules/Modal";
import { Group, GroupInputs } from "../../../app/components/elements/Form";
import { Input } from "@material-tailwind/react";
import { FileUploader } from "react-drag-drop-files";
import { useModal } from "../../../app/hooks/useModal";
import { useTable } from "react-table";
import { axiosRequest } from "../../../app/utils/axios-request";
import { useAuthState } from "../../../contexts/auth.context";
import { useMemo, useState, useEffect, useContext } from "react";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { ToastAlert } from "../../../app/components/elements/ToastAlert";
import { errorProps, successProps } from "../../../app/utils/alert-config";
import { FormContext } from "../../../contexts/form.context";
import TableComplete from "../../../app/components/modules/TableComplete";

const fileTypes = ["JPEG", "PNG"];

const schema = yup.object().shape({
  ruc: yup.number().required(),
  nombre: yup.string().required(),
  direccion: yup.string().required(),
  telefono: yup.string().required(),
  email: yup.string().nullable().email(),
  web: yup.string().nullable(),
});

export default function DatosEmpresa() {
  const { isOpenModal, isOpenModalDelete, isEdit, setIsOpenModalDelete, closeModal, openModal } =
    useModal();
  const [file, setFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [empresaForm, setEmpresaForm] = useState({
    ruc: null,
    direccion: null,
    telefono: null,
    email: null,
    nombre: null,
    web: null,
    logo: null,
  });
  const auth = useAuthState();
  const [empresaToUpdateId, setEmpresaToUpdateId] = useState(null);
  const { elementId, setElementId, changeData, setChangeData } = useContext(FormContext);

  const getEmpresas = async () => {
    const { data } = await axiosRequest("get", `/api/mantenimiento/empresas?adminId=${auth.id}`);

    return data;
  };

  const handleChange = (file) => {
    setFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Datos de la empresa
  const columns = useMemo(
    () => [
      { Header: "N°", accessor: "id" },
      { Header: "RUC / DNI", accessor: "razonSocial" },
      { Header: "Nombre Cliente", accessor: "nombreCliente" },
      { Header: "Fecha", accessor: "fecha" },
      { Header: "Dias validez", accessor: "diasValidez" },
      { Header: "Forma de pago", accessor: "formaDePago" },
      { Header: "Correo", accessor: "email" },

    ],
    []
  );

  useEffect(() => {
    setEmpresaForm({
      ruc: null,
      direccion: null,
      telefono: null,
      email: null,
      nombre: null,
      web: null,
      logo: null,
    });
    refetch();
  }, [changeData]);

  const { data, isLoading, refetch } = useQuery("empresas", getEmpresas, {
    initialData: {
      data: [],
    },
  });

  const empresas = useMemo(() => data.data, [data.data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: empresas,
  });

  const updateEmpresa = async () => {
    await schema.validate(empresaForm, { abortEarly: false });
    await axiosRequest("put", `/api/mantenimiento/empresas/${empresaToUpdateId}`, {
      ...empresaForm,
    });

    toast.success(`🦄 Empresa actualizada exitosamente!`, successProps);
  };

  const createEmpresa = async () => {
    await schema.validate(empresaForm, { abortEarly: false });
    const { data } = await axiosRequest("post", "/api/mantenimiento/empresas", {
      ...empresaForm,
      adminId: auth.id,
    });

    toast.success(`🦄 Empresa ${data.nombre} registrada exitosamente!`, successProps);
  };

  const saveData = async () => {
    try {
      if (isEdit) {
        await updateEmpresa();
      } else {
        await createEmpresa();
      }
      setChangeData(!changeData);
      closeModal();
    } catch (error) {
      toast.error(<ToastAlert error={error} />, errorProps);
    }
  };

  const deleteEmpresa = async () => {
    try {
      const { data } = await axiosRequest("delete", `/api/mantenimiento/empresas/${elementId}`);
      toast.success(`🦄 Empresa ${data.nombre} eliminada exitosamente!`, successProps);
      setChangeData(!changeData);
      setIsOpenModalDelete(false);
    } catch (error) {
      toast.error(<ToastAlert error={error} />, errorProps);
    }
  };

  return (
    <>
      <Container whiteColor={true}>
        <Title text={"Guías de remision"}>
          <ButtonAdd text={"Nueva Guía"} onClick={() => openModal(false)} />
        </Title>

        {/* Table List */}
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <TableComplete
            columns={columns}
            data={[]}
            openModal={openModal}
            setIsOpenModalDelete={setIsOpenModalDelete}
          />
        )}
      </Container>
      {/* Modal agregar */}
      <ModalLg
        title={isEdit ? "Editar Empresa" : "Nueva Empresa"}
        isOpen={isOpenModal}
        closeModal={closeModal}
      >
        <Group title={"Logo de la empresa"}>
          <FileUploader
            multiple={false}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
            accept={fileTypes}
          >
            <div className="flex justify-center items-center rounded-md border-2 border-dashed border-primary-200 py-10 bg-primary-50">
              <div className="space-y-1 text-center flex flex-col items-center">
                <Logo className="text-primary-200" />
                <div className="flex text-sm text-primary-600">
                  <p className="pl-1">
                    Arrastre y suelte su imagen aqui, o{" "}
                    <span className="cursor-pointer font-semibold">Seleccione un archivo</span>{" "}
                  </p>
                </div>
              </div>
            </div>
          </FileUploader>
          <p>
            {file ? (
              <div className=" w-full flex gap-2 text-xs items-center">
                <Image alt="logo" src={logoPreview} width={100} height={20} />{" "}
                {`Nombre del archivo: ${file.name}`}
              </div>
            ) : (
              ""
            )}
          </p>
        </Group>
        <Group title={"Datos de la empresa"}>
          <GroupInputs>
            <Input
              label="RUC"
              defaultValue={isEdit ? empresaForm.ruc : undefined}
              onChange={(e) => {
                setEmpresaForm({ ...empresaForm, ruc: e.target.value });
              }}
            />
            <Input
              label="Nombre"
              title="hola mundo"
              defaultValue={isEdit ? empresaForm.nombre : undefined}
              onChange={(e) => {
                setEmpresaForm({ ...empresaForm, nombre: e.target.value });
              }}
            />
          </GroupInputs>
          <GroupInputs>
            <Input
              label="Dirección"
              defaultValue={isEdit ? empresaForm.direccion : undefined}
              onChange={(e) => {
                setEmpresaForm({ ...empresaForm, direccion: e.target.value });
              }}
            />
            <Input
              label="Teléfono"
              defaultValue={isEdit ? empresaForm.telefono : undefined}
              onChange={(e) => {
                setEmpresaForm({ ...empresaForm, telefono: e.target.value });
              }}
            />
          </GroupInputs>
          <GroupInputs>
            <Input
              label="Correo"
              defaultValue={isEdit ? empresaForm.email : undefined}
              onChange={(e) => {
                setEmpresaForm({ ...empresaForm, email: e.target.value });
              }}
            />
            <Input
              label="Página web"
              defaultValue={isEdit ? empresaForm.web : undefined}
              onChange={(e) => {
                setEmpresaForm({ ...empresaForm, web: e.target.value });
              }}
            />
          </GroupInputs>
        </Group>
        <div className="w-full flex justify-end gap-5">
          <ButtonCancel onClick={closeModal} />
          <ButtonSave onClick={saveData} />
        </div>
      </ModalLg>

      {/* Modal Eliminar */}
      <ModalConfirmDelete
        onClick={deleteEmpresa}
        title={"Eliminar Empresa"}
        isOpen={isOpenModalDelete}
        closeModal={() => setIsOpenModalDelete(false)}
      />
    </>
  );
}
