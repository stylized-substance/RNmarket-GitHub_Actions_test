import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface DeleteModalProps {
  showDeleteModal: boolean;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: () => void;
}

const DeleteModal = ({
  showDeleteModal,
  setShowDeleteModal,
  handleDelete
}: DeleteModalProps) => {
  return (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header>
        <Modal.Title>Really delete?</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button
          style={{ background: 'black' }}
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </Button>
        <Button
          style={{ background: 'firebrick' }}
          onClick={() => handleDelete()}
          className="d-flex gap-2"
        >
          <div>Delete</div>
          <i className="bi bi-trash3"></i>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
