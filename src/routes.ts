import adminUserModule from "./modules/admin/user-management/user.module";
import adminAuthModule from "./modules/admin/user-management/user.auth";
import userModule from "./modules/user/user.module";
import authModule from "./modules/user/user.auth";
import genericFindAll from "./modules/admin/generic/findAll";
import genericCreate from "./modules/admin/generic/create";
import genericEdit from "./modules/admin/generic/edit";
import genericFindByID from "./modules/admin/generic/findByID";
import genericFindOne from "./modules/admin/generic/findOne";
import genericDelete from "./modules/admin/generic/delete";
const routes = [
    /** ADMIN API */
    {
        url: '/api/admin/user',
        module: adminUserModule
    },
    {
        url: '/api/admin/auth',
        module: adminAuthModule
    },
    /** ADMIN GENERIC API */
    {
        url: '/api/admin/create',
        module: genericCreate
    },
    {
        url: '/api/admin/edit',
        module: genericEdit
    },
    {
        url: '/api/admin/findByID',
        module: genericFindByID
    },
    {
        url: '/api/admin/findOne',
        module: genericFindOne
    },
    {
        url: '/api/admin/findAll',
        module: genericFindAll
    },
    {
        url: '/api/admin/delete',
        module: genericDelete
    },
    /** USER API */
    {
        url: '/api/user',
        module: userModule
    },
    {
        url: '/api/auth',
        module: authModule
    }
];
export default routes;