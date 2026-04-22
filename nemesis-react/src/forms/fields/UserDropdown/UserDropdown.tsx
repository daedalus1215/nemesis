import styles from "./UserDropdown.module.css";
import { User } from "../../../api/responses/user.response";

export const UserDropdown = ({ formData, handleInputChange, users, user }:
    {
        formData: { toUserId: string },
        handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
        users: User[],
        user: User
    }) => {
    return (
        <div className={styles.formGroup}>
            <label htmlFor="toUserId" className={styles.label}>
                To <span className={styles.required}>*</span>
            </label>
            <select
                id="toUserId"
                name="toUserId"
                value={formData.toUserId}
                onChange={handleInputChange}
                className={styles.select}
                required
            >
                <option value="">Select recipient</option>
                {users
                    .filter(userOption => userOption.id !== user.id)
                    .map((userOption) => (
                        <option key={userOption.id} value={userOption.id}>
                            {userOption.username}
                        </option>
                    ))}
            </select>
        </div>
    );
};