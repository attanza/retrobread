import faker from '@/libs/faker';
import { Redis } from '@/libs/redis';
import { AddressService } from '@/modules/address/address.service';
import { AuditService } from '@/modules/audit/audit.service';
import { CategoryService } from '@/modules/category/category.service';
import { MockCourierService } from '@/modules/mock-courier/mock-courier.service';
import { MockPaymentService } from '@/modules/mock-payment/mock-payment.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { OrderService } from '@/modules/order/order.service';
import { PermissionService } from '@/modules/permission/permission.service';
import { ProductPackageService } from '@/modules/product-package/product-package.service';
import { ProductService } from '@/modules/product/product.service';
import { PromoService } from '@/modules/promo/promo.service';
import { RoleService } from '@/modules/role/role.service';
import { IUser } from '@/modules/user/user.interface';
import { UserService } from '@/modules/user/user.service';
import { EVoucherType } from '@/modules/voucher/voucher.interface';
import { VoucherService } from '@/modules/voucher/voucher.service';
import { Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { paramCase, snakeCase } from 'change-case';
import moment from 'moment';
import { EResources } from '../enums/resource.enum';
@Injectable()
export class SeederService {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly addressService: AddressService,
    private readonly productPackageService: ProductPackageService,
    private readonly voucherService: VoucherService,
    private readonly promoService: PromoService,
    private readonly mockPaymentService: MockPaymentService,
    private readonly mockCourierService: MockCourierService,
    private readonly orderService: OrderService,
  ) {}

  async runSeeder(): Promise<void> {
    await Redis.flushall();
    Logger.log('Clear Audit');
    await this.auditService.deleteMany();

    Logger.log('Seeding roles ...');
    await this.roleService.deleteMany();
    const roles = ['Super Administrator', 'Administrator', 'User'];
    const roleData = [];
    roles.map(r =>
      roleData.push({
        name: r,
        slug: paramCase(r),
        description: '',
      }),
    );
    await this.roleService.insertMany(roleData);
    Logger.log('Seeding roles completed');

    Logger.log('Seeding permissions ...');
    await this.permissionService.deleteMany();

    const resources: string[] = [];
    for (const resource in EResources) {
      resources.push(resource);
    }
    const actions = ['Read', 'Create', 'Update', 'Delete'];
    const permissionData = [];
    resources.map(r => {
      actions.map(a => {
        const name = `${a} ${r}`;
        permissionData.push({
          name,
          slug: paramCase(name),
          description: '',
        });
      });
    });

    await this.permissionService.insertMany(permissionData);
    Logger.log('Seeding permissions completed');

    Logger.log('Seeding users ...');
    await this.userService.deleteMany();

    const userData: Partial<IUser>[] = [];
    const allRoles = await this.roleService.allRoles();
    const hashedPassword = await hash('1jmLHxTK', 12);
    allRoles.map(r =>
      userData.push({
        name: r.name,
        email: `${snakeCase(r.name)}@retrobread.com`,
        phone: faker.phone(),
        isActive: true,
        blocked: false,
        role: r._id,
        password: hashedPassword,
      }),
    );
    await this.userService.insertMany(userData);
    Logger.log('Seeding users completed');

    Logger.log('Seeding additional users');
    const userRole = await this.roleService.getRoleBySlug('user');
    const userUserData = [];
    for (let i = 1; i < 5; i++) {
      const name = `User ${i}`;
      userUserData.push({
        name: name,
        email: `${snakeCase(name)}@retrobread.com`,
        phone: faker.phone(),
        isActive: true,
        blocked: false,
        role: userRole._id,
        password: hashedPassword,
      });
    }
    await this.userService.insertMany(userUserData);
    Logger.log('Seeding additional users completed');

    Logger.log('Seeding role permission ...');
    const allPermissions = await this.permissionService.allPermissions();
    const permissionIds = allPermissions.map(p => p._id);
    const superAdminRole = await this.roleService.getRoleBySlug(
      'super-administrator',
    );
    superAdminRole.permissions = permissionIds;
    await superAdminRole.save();
    Logger.log('Seeding role permission completed');

    Logger.log('Seeding categories ...');
    await this.categoryService.deleteMany();
    const categoryData = [];
    for (let i = 0; i < 10; i++) {
      const name = faker.word({ syllables: 4 }) + ' ' + i;
      categoryData.push({ name, slug: paramCase(name) });
    }
    await this.categoryService.insertMany(categoryData);

    Logger.log('Seeding categories completed');

    Logger.log('Seeding products ...');
    await this.productService.deleteMany();
    const allCategories = await this.categoryService.allCategories();
    const productData = [];
    for (let i = 0; i < 25; i++) {
      const price = faker.integer({ min: 20000, max: 300000 });
      const categories = [];
      for (let j = 0; j < 2; j++) {
        categories.push(
          allCategories[
            faker.integer({ min: 0, max: allCategories.length - 1 })
          ]._id,
        );
      }
      productData.push({
        name: faker.first() + i,
        categories,
        price,
        discountPrice: 0 * price,
        stock: 100,
        description: faker.paragraph(),
        images: [
          {
            url: 'https://picsum.photos/400/200',
            published: true,
            default: true,
          },
          {
            url: 'https://picsum.photos/400/200',
            published: true,
            default: false,
          },
        ],
      });
    }
    await this.productService.insertMany(productData);

    Logger.log('Seeding products completed');

    Logger.log('Seeding notifications ...');
    await this.notificationService.deleteMany();
    Logger.log('Seeding notifications completed');

    Logger.log('Seeding address ...');
    await this.addressService.deleteMany();
    const allUser = await this.userService.allUser();
    const addressData = [];
    allUser.map(user =>
      addressData.push({
        street: faker.street(),
        district: faker.state(),
        village: faker.state(),
        user: user._id,
        city: faker.city(),
        province: faker.province(),
        country: faker.country(),
        postCode: faker.postcode(),
        latitude: -6.917464,
        longitude: 107.619125,
        addressType: 'Home',
        default: true,
      }),
    );
    await this.addressService.insertMany(addressData);
    Logger.log('Seeding notifications completed');

    Logger.log('Seeding ProductPackages ...');
    await this.productPackageService.deleteMany();
    Logger.log('Seeding ProductPackages completed');

    Logger.log('Seeding vouchers ...');
    await this.voucherService.deleteMany();
    const voucherData = [];
    const voucherTypes = [];
    for (const t in EVoucherType) {
      voucherTypes.push(t);
    }
    for (let i = 0; i < 25; i++) {
      const voucherType =
        voucherTypes[faker.integer({ min: 0, max: voucherTypes.length - 1 })];
      const voucherValue =
        voucherType === EVoucherType.percentage
          ? faker.integer({ min: 2, max: 15 })
          : faker.integer({ min: 2000, max: 10000 });
      voucherData.push({
        code: faker.bb_pin(),
        description: faker.sentence(),
        title: faker.sentence(),
        validFrom: moment(
          `2020-07-${faker.integer({ min: 1, max: 28 })}`,
        ).toDate(),
        validUntil: moment(
          `2020-08-${faker.integer({ min: 1, max: 28 })}`,
        ).toDate(),
        image: 'https://picsum.photos/400/200',
        voucherType,
        voucherValue: String(voucherValue),
      });
    }
    await this.voucherService.insertMany(voucherData);
    Logger.log('Seeding vouchers completed');

    Logger.log('Seeding promo ...');
    await this.promoService.deleteMany();
    const promoData = [];
    for (let i = 0; i < 25; i++) {
      promoData.push({
        title: faker.sentence(),
        subtitle: faker.sentence(),
        description: faker.paragraph(),
        validFrom: moment(
          `2020-06-${faker.integer({ min: 1, max: 28 })}`,
        ).toDate(),
        validUntil: moment(
          `2020-07-${faker.integer({ min: 1, max: 28 })}`,
        ).toDate(),
        image: 'https://picsum.photos/400/200',
        published: true,
      });
    }
    await this.promoService.insertMany(promoData);
    Logger.log('Seeding promo completed');

    Logger.log('Seeding MockPayments ...');
    await this.mockPaymentService.deleteMany();
    const mockPaymentData = [
      {
        provider: 'Gopay',
        consumers: [],
      },
      {
        provider: 'Ovo',
        consumers: [],
      },
    ];
    await this.mockPaymentService.insertMany(mockPaymentData);
    Logger.log('Seeding MockPayments completed');

    Logger.log('Seeding MockCouriers ...');
    await this.mockCourierService.deleteMany();
    const mockCourierData = [
      {
        provider: 'JNE',
        price: 1000,
      },
      {
        provider: 'TIKI',
        consumers: 10500,
      },
    ];
    await this.mockCourierService.insertMany(mockCourierData);
    Logger.log('Seeding MockCouriers completed');

    Logger.log('Seeding Orders ...');
    await this.orderService.deleteMany();
    Logger.log('Seeding Orders completed');
  }
}
