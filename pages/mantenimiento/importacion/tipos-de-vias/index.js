import { Input, Textarea } from "@material-tailwind/react";
import { useMemo } from "react";
import {
	ButtonAdd,
	ButtonCancel,
	ButtonImportData,
	ButtonSave,
} from "../../../../app/components/elements/Buttons";
import { Title } from "../../../../app/components/elements/Title";
import {
	Modal,
	ModalConfirmDelete,
} from "../../../../app/components/modules/Modal";
import TableComplete from "../../../../app/components/modules/TableComplete";
import TemplateImportacion from "../../../../app/components/templates/mantenimiento/TemplateImportacion";
import { useModal } from "../../../../app/hooks/useModal";
import { tiposDeVias } from "../../../../data/tipos-de-vias";

export default function TiposVias() {
	const {
		isOpenModal,
		isOpenModalDelete,
		isEdit,
		setIsOpenModalDelete,
		closeModal,
		openModal,
	} = useModal();

	const saveData = () => {
		closeModal();
	};

	const columns = useMemo(
		() => [
			{ Header: "#", accessor: "id" },
			{ Header: "Codigo", accessor: "codigo" },
			{ Header: "Nombre", accessor: "nombre" },
			{ Header: "Descripción", accessor: "descripcion" },
		],
		[]
	);

	const data = useMemo(() => tiposDeVias, []);

	return (
		<>
			<TemplateImportacion>
				<Title text={"Lista Tipos de vías"}>
					<div className="flex gap-4">
						<ButtonImportData />
						<ButtonAdd
							text={"Nuevo tipo"}
							onClick={() => openModal(false)}
						/>
					</div>
				</Title>
				{/* Table list */}
				<TableComplete
					columns={columns}
					data={data}
					openModal={openModal}
					setIsOpenModalDelete={setIsOpenModalDelete}
				/>
			</TemplateImportacion>
			{/* Modal agregar */}
			<Modal
				title={isEdit ? "Editar Tipo de vía" : "Nuevo Tipo de vía"}
				isOpen={isOpenModal}
				closeModal={closeModal}
			>
				{/* Form */}
				<form className="flex flex-col gap-5">
					<Input label="Nombre" />
					<Textarea label="Descripción" />
					<div className="w-full flex justify-end gap-5">
						<ButtonCancel onClick={closeModal} />
						<ButtonSave onClick={saveData} />
					</div>
				</form>
			</Modal>
			{/* Modal Eliminar */}
			<ModalConfirmDelete
				title={"Eliminar Tipo de vía"}
				isOpen={isOpenModalDelete}
				closeModal={() => setIsOpenModalDelete(false)}
			/>
		</>
	);
}
