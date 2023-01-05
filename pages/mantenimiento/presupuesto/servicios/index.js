import { Input } from "@material-tailwind/react";
import { useEffect, useMemo, useState } from "react";
import { ButtonAdd, ButtonCancel, ButtonSave } from "../../../../app/components/elements/Buttons";
import { Title } from "../../../../app/components/elements/Title";
import { Modal, ModalConfirmDelete } from "../../../../app/components/modules/Modal";
import TableComplete from "../../../../app/components/modules/TableComplete";
import TemplatePresupuesto from "../../../../app/components/templates/mantenimiento/TemplatePresupuesto";
import { useModal } from "../../../../app/hooks/useModal";
import { axiosRequest } from "../../../../app/utils/axios-request";
import { useLocalStorage } from "../../../../app/hooks/useLocalStorage";
import { useQuery } from "react-query";
import * as yup from "yup";
import { toast } from "react-toastify";
import { errorProps, successProps } from "../../../../app/utils/alert-config";
import { ToastAlert } from "../../../../app/components/elements/ToastAlert";

const schema = yup.object().shape({
  codigo: yup.string().required(),
  definicion: yup.string().required(),
  precio: yup.number().required(),
});

export default function Servicios() {
  const { isOpenModal, isOpenModalDelete, isEdit, setIsOpenModalDelete, closeModal, openModal } =
    useModal();
  const [empresaId] = useLocalStorage("empresaId");
  const [form, setForm] = useState({
    codigo: null,
    definicion: null,
    precio: null,
  });
  const [changeData, setChangeData] = useState(false);

  const saveData = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      await axiosRequest("post", "/api/mantenimiento/presupuesto/servicios", {
        ...form,
        empresaId: parseInt(empresaId),
        precio: parseFloat(form.precio),
      });

      toast.success(`🦄 Registro guardado exitosamente!`, successProps);
      setChangeData(!changeData);
      closeModal();
    } catch (error) {
      toast.error(<ToastAlert error={error} />, errorProps);
    }
  };

  useEffect(() => {
    setForm({
      codigo: null,
      definicion: null,
      precio: null,
    });
    refetch();
  }, [changeData]);

  const columns = useMemo(
    () => [
      { Header: "#", accessor: "id" },
      { Header: "Codigo", accessor: "codigo" },
      { Header: "Definición", accessor: "definicion" },
      { Header: "Precio", accessor: "precio" },
    ],
    []
  );

  const getServicios = async () => {
    const { data } = await axiosRequest(
      "get",
      `/api/mantenimiento/presupuesto/servicios?empresaId=${empresaId}`
    );

    return data;
  };
  const { data, refetch } = useQuery("getServicios", getServicios, {
    initialData: {
      data: [],
    },
  });

  const servicios = useMemo(() => data?.data, [data?.data]);

  return (
    <>
      <TemplatePresupuesto>
        <Title text={"Lista Servicios"}>
          <div className="flex gap-4">
            <ButtonAdd text={"Nuevo servicio"} onClick={() => openModal(false)} />
          </div>
        </Title>
        {/* Table list */}
        <TableComplete
          columns={columns}
          data={servicios}
          openModal={openModal}
          setIsOpenModalDelete={setIsOpenModalDelete}
        />
      </TemplatePresupuesto>
      {/* Modal agregar */}
      <Modal
        title={isEdit ? "Editar Servicio" : "Nuevo Servicio"}
        isOpen={isOpenModal}
        closeModal={closeModal}
      >
        {/* Form */}
        <form className="flex flex-col gap-5">
          <Input label="Código" onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <Input
            label="Definición"
            onChange={(e) => setForm({ ...form, definicion: e.target.value })}
          />
          <Input
            label="Precio"
            type={"number"}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
          <div className="w-full flex justify-end gap-5">
            <ButtonCancel onClick={closeModal} />
            <ButtonSave onClick={saveData} />
          </div>
        </form>
      </Modal>
      {/* Modal Eliminar */}
      <ModalConfirmDelete
        title={"Eliminar Servicio"}
        isOpen={isOpenModalDelete}
        closeModal={() => setIsOpenModalDelete(false)}
      />
    </>
  );
}
