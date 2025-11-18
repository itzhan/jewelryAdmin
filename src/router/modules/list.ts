import { lazy } from 'react';
import { ViewModuleIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const result: IRouter[] = [
  {
    path: '/manage',
    meta: {
      title: '数据表管理',
      Icon: ViewModuleIcon,
    },
    children: [
      {
        path: 'stone-shapes',
        Component: lazy(() => import('pages/Stones/Shapes')),
        meta: { title: '石头形状表（stone_shapes）' },
      },
      {
        path: 'stone-colors',
        Component: lazy(() => import('pages/Stones/ColorGrades')),
        meta: { title: '石头颜色等级表（stone_color_grades）' },
      },
      {
        path: 'stone-clarities',
        Component: lazy(() => import('pages/Stones/ClarityGrades')),
        meta: { title: '石头净度等级表（stone_clarity_grades）' },
      },
      {
        path: 'stone-cuts',
        Component: lazy(() => import('pages/Stones/CutGrades')),
        meta: { title: '石头切工等级表（stone_cut_grades）' },
      },
      {
        path: 'stone-certificates',
        Component: lazy(() => import('pages/Stones/Certificates')),
        meta: { title: '石头证书机构表（stone_certificates）' },
      },
      {
        path: 'stones',
        Component: lazy(() => import('pages/List/Stones')),
        meta: { title: '石头表（stones）' },
      },
      {
        path: 'product-categories',
        Component: lazy(() => import('pages/Products/Categories')),
        meta: { title: '产品类型表（product_categories）' },
      },
      {
        path: 'products',
        Component: lazy(() => import('pages/Products/List')),
        meta: { title: '产品表（products）' },
      },
      {
        path: 'product-images',
        Component: lazy(() => import('pages/Products/Images')),
        meta: { title: '产品图片表（product_images）' },
      },
    ],
  },
];

export default result;
