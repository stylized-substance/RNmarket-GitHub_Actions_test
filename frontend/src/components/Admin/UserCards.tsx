import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';

import { UserFromBackend, ItemToDelete } from '#src/types/types.ts';

const UserCards = ({
  users,
  prepareForDelete
}: {
  users: UserFromBackend[] | undefined;
  prepareForDelete: (item: ItemToDelete) => void;
}) => {
  return (
    <Card>
      <Card.Header>Users in database</Card.Header>
      <Card.Body>
        <Accordion>
          {users?.map((user) => (
            <div key={user.id} className="mb-2">
              <Accordion.Item key={user.id} eventKey={user.id}>
                <Accordion.Header>{user.username}</Accordion.Header>
                <Accordion.Body>
                  <dl>
                    <dt>Id</dt>
                    <dd>{user.id}</dd>
                    <dt>Name</dt>
                    <dd>{user.name}</dd>
                    <dt>Admin user</dt>
                    <dd>{user.isadmin ? 'Yes' : 'No'}</dd>
                    <dt>Created at</dt>
                    <dd>{user.createdAt}</dd>
                    <dt>Updated at</dt>
                    <dd>{user.updatedAt}</dd>
                  </dl>
                  <Button
                    style={{ background: 'firebrick' }}
                    onClick={() =>
                      prepareForDelete({ type: 'users', id: user.id })
                    }
                    className="d-flex gap-2"
                  >
                    <div>Delete</div>
                    <i className="bi bi-trash3"></i>
                  </Button>
                </Accordion.Body>
              </Accordion.Item>
            </div>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default UserCards;
